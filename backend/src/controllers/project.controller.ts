import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError, catchAsync } from '../middlewares/error.middleware';
import { io } from '../index';

// すべてのプロジェクトを取得
export const getAllProjects = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // ユーザーが所有するプロジェクトと共同作業者として参加しているプロジェクトを取得
    const ownedProjects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    const collaboratingProjects = await prisma.projectCollaborator.findMany({
      where: { userId },
      include: {
        project: true,
      },
      orderBy: { project: { updatedAt: 'desc' } },
    });

    // 共同作業者プロジェクトを整形
    const formattedCollaboratingProjects = collaboratingProjects.map(
      (collab) => ({
        ...collab.project,
        role: collab.role,
      })
    );

    // 両方のプロジェクトを結合
    const projects = [
      ...ownedProjects.map((project) => ({ ...project, role: 'owner' })),
      ...formattedCollaboratingProjects,
    ];

    res.status(200).json({
      status: 'success',
      results: projects.length,
      projects,
    });
  }
);

// 新しいプロジェクトを作成
export const createProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // プロジェクトの作成
    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId,
      },
    });

    // 初期ファイル構造の作成
    const rootDir = await prisma.projectFile.create({
      data: {
        name: 'root',
        path: '/',
        content: '',
        type: 'directory',
        projectId: project.id,
      },
    });

    // サンプルファイルの作成
    await prisma.projectFile.create({
      data: {
        name: 'index.html',
        path: '/index.html',
        content: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Welcome to ${name}</h1>
    <p>AIアシスタントを使って開発を始めましょう！</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        type: 'file',
        projectId: project.id,
        parentId: rootDir.id,
      },
    });

    await prisma.projectFile.create({
      data: {
        name: 'style.css',
        path: '/style.css',
        content: `body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  background-color: #f4f4f4;
}

.container {
  width: 80%;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #333;
}

p {
  color: #666;
}`,
        type: 'file',
        projectId: project.id,
        parentId: rootDir.id,
      },
    });

    await prisma.projectFile.create({
      data: {
        name: 'script.js',
        path: '/script.js',
        content: `// JavaScriptコードをここに記述します
console.log('Welcome to ${name}');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
});`,
        type: 'file',
        projectId: project.id,
        parentId: rootDir.id,
      },
    });

    res.status(201).json({
      status: 'success',
      project,
    });
  }
);

// 特定のプロジェクトを取得
export const getProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;

    // プロジェクトの取得
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return next(new AppError('プロジェクトが見つかりません', 404));
    }

    // プロジェクトのファイル構造を取得
    const files = await prisma.projectFile.findMany({
      where: { projectId },
    });

    // ファイル構造をツリー形式に変換
    const fileTree = buildFileTree(files);

    res.status(200).json({
      status: 'success',
      project,
      files: fileTree,
    });
  }
);

// プロジェクトを更新
export const updateProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const { name, description } = req.body;

    // プロジェクトの更新
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
      },
    });

    res.status(200).json({
      status: 'success',
      project,
    });
  }
);

// プロジェクトを削除
export const deleteProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;

    // プロジェクトの削除（関連するファイルやチャット履歴も削除される）
    await prisma.project.delete({
      where: { id: projectId },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

// プロジェクトの共同作業者を取得
export const getCollaborators = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;

    // 共同作業者の取得
    const collaborators = await prisma.projectCollaborator.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      results: collaborators.length,
      collaborators,
    });
  }
);

// プロジェクトに共同作業者を追加
export const addCollaborator = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // プロジェクトの所有者かどうかを確認
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return next(new AppError('プロジェクトが見つかりません', 404));
    }

    if (project.userId !== userId) {
      return next(
        new AppError('プロジェクトの所有者のみが共同作業者を追加できます', 403)
      );
    }

    // 招待するユーザーの検索
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return next(new AppError('指定されたメールアドレスのユーザーが見つかりません', 404));
    }

    // 自分自身を共同作業者として追加することはできない
    if (invitedUser.id === userId) {
      return next(new AppError('自分自身を共同作業者として追加することはできません', 400));
    }

    // 既に共同作業者かどうかを確認
    const existingCollaborator = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingCollaborator) {
      return next(new AppError('このユーザーは既に共同作業者です', 400));
    }

    // 共同作業者の追加
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        userId: invitedUser.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      collaborator,
    });
  }
);

// プロジェクトから共同作業者を削除
export const removeCollaborator = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId, userId: collaboratorId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // プロジェクトの所有者かどうかを確認
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return next(new AppError('プロジェクトが見つかりません', 404));
    }

    if (project.userId !== userId) {
      return next(
        new AppError('プロジェクトの所有者のみが共同作業者を削除できます', 403)
      );
    }

    // 共同作業者の削除
    await prisma.projectCollaborator.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: collaboratorId,
        },
      },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

// ファイル構造をツリー形式に変換するヘルパー関数
function buildFileTree(files: any[]) {
  const fileMap = new Map();
  const rootFiles: any[] = [];

  // ファイルをマップに格納
  files.forEach((file) => {
    fileMap.set(file.id, { ...file, children: [] });
  });

  // 親子関係を構築
  files.forEach((file) => {
    const fileWithChildren = fileMap.get(file.id);
    if (file.parentId) {
      const parent = fileMap.get(file.parentId);
      if (parent) {
        parent.children.push(fileWithChildren);
      }
    } else {
      rootFiles.push(fileWithChildren);
    }
  });

  return rootFiles;
}