import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError, catchAsync } from '../middlewares/error.middleware';
import { OpenAIService } from '../services/ai/openai.service';
import { io } from '../index';
import path from 'path';
import fs from 'fs/promises';

// チャット履歴の取得
export const getChatHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // チャット履歴の取得
    const messages = await prisma.chatMessage.findMany({
      where: {
        projectId,
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      messages,
    });
  }
);

// メッセージの送信
export const sendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // プロジェクトの存在確認
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return next(new AppError('プロジェクトが見つかりません', 404));
    }

    // ユーザーメッセージの保存
    const userMessage = await prisma.chatMessage.create({
      data: {
        role: 'user',
        content: message,
        userId,
        projectId,
      },
    });

    // プロジェクトのファイル構造を取得
    const files = await prisma.projectFile.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        path: true,
        type: true,
      },
    });

    // AIレスポンスの生成
    try {
      // プロジェクトコンテキストの構築
      const context = {
        projectId,
        projectName: project.name,
        projectDescription: project.description || undefined,
        files: files.map(file => ({
          path: file.path,
          type: file.type as 'file' | 'directory',
        })),
      };

      // AIレスポンスの生成
      const aiResponse = await OpenAIService.generateCode(message, context);

      // AIメッセージの保存
      const assistantMessage = await prisma.chatMessage.create({
        data: {
          role: 'assistant',
          content: aiResponse,
          userId,
          projectId,
        },
      });

      res.status(200).json({
        status: 'success',
        message: assistantMessage,
      });
    } catch (error) {
      console.error('AI response generation error:', error);
      
      // エラーメッセージの保存
      await prisma.chatMessage.create({
        data: {
          role: 'assistant',
          content: 'すみません、エラーが発生しました。もう一度お試しください。',
          userId,
          projectId,
        },
      });

      return next(new AppError('AIレスポンスの生成中にエラーが発生しました', 500));
    }
  }
);

// コード生成
export const generateCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const { prompt, language, framework } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // プロジェクトの存在確認
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return next(new AppError('プロジェクトが見つかりません', 404));
    }

    // プロジェクトのファイル構造を取得
    const files = await prisma.projectFile.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        path: true,
        type: true,
      },
    });

    // AIコード生成
    try {
      // プロジェクトコンテキストの構築
      const context = {
        projectId,
        projectName: project.name,
        projectDescription: project.description || undefined,
        files: files.map(file => ({
          path: file.path,
          type: file.type as 'file' | 'directory',
        })),
        language,
        framework,
      };

      // AIコード生成
      const generatedCode = await OpenAIService.generateCode(prompt, context);

      res.status(200).json({
        status: 'success',
        code: generatedCode,
      });
    } catch (error) {
      console.error('Code generation error:', error);
      return next(new AppError('コード生成中にエラーが発生しました', 500));
    }
  }
);

// コード改善
export const improveCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const { code, instructions } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // プロジェクトの存在確認
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return next(new AppError('プロジェクトが見つかりません', 404));
    }

    // AIコード改善
    try {
      // AIコード改善
      const improvedCode = await OpenAIService.improveCode(code, instructions);

      res.status(200).json({
        status: 'success',
        code: improvedCode,
      });
    } catch (error) {
      console.error('Code improvement error:', error);
      return next(new AppError('コード改善中にエラーが発生しました', 500));
    }
  }
);

// コード適用
export const applyCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const { code, path: filePath } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // プロジェクトの存在確認
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return next(new AppError('プロジェクトが見つかりません', 404));
    }

    try {
      // コードからファイル名を抽出（ファイルパスが指定されていない場合）
      let targetPath = filePath;
      if (!targetPath) {
        // コードの先頭コメントからファイル名を抽出する簡易的な処理
        const fileNameMatch = code.match(/\/\/\s*filename:\s*([^\n]+)/i) || 
                             code.match(/\/\*\s*filename:\s*([^\n]+)\s*\*\//i);
        
        if (fileNameMatch && fileNameMatch[1]) {
          targetPath = fileNameMatch[1].trim();
        } else {
          return next(new AppError('ファイルパスが指定されていません', 400));
        }
      }

      // パスの正規化
      targetPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;

      // ファイルの存在確認
      let projectFile = await prisma.projectFile.findFirst({
        where: {
          projectId,
          path: targetPath,
        },
      });

      if (projectFile) {
        // 既存ファイルの更新
        projectFile = await prisma.projectFile.update({
          where: { id: projectFile.id },
          data: {
            content: code,
            updatedAt: new Date(),
          },
        });
      } else {
        // 新規ファイルの作成
        const fileName = path.basename(targetPath);
        const dirPath = path.dirname(targetPath);
        
        // 親ディレクトリの確認
        let parentId: string | null = null;
        if (dirPath !== '/') {
          const parentDir = await prisma.projectFile.findFirst({
            where: {
              projectId,
              path: dirPath,
              type: 'directory',
            },
          });
          
          if (!parentDir) {
            // 親ディレクトリが存在しない場合は作成
            const newDir = await prisma.projectFile.create({
              data: {
                name: path.basename(dirPath),
                path: dirPath,
                content: '',
                type: 'directory',
                projectId,
              },
            });
            parentId = newDir.id;
          } else {
            parentId = parentDir.id;
          }
        }
        
        // 新規ファイルの作成
        projectFile = await prisma.projectFile.create({
          data: {
            name: fileName,
            path: targetPath,
            content: code,
            type: 'file',
            projectId,
            parentId,
          },
        });
      }

      res.status(200).json({
        status: 'success',
        file: {
          id: projectFile.id,
          name: projectFile.name,
          path: projectFile.path,
        },
      });
    } catch (error) {
      console.error('Code application error:', error);
      return next(new AppError('コード適用中にエラーが発生しました', 500));
    }
  }
);