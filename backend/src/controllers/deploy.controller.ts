import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError, catchAsync } from '../middlewares/error.middleware';
import { DockerDeployService } from '../services/deploy/docker.service';

// プロジェクトのデプロイ
export const deployProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
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

    // プロジェクトのステータスを更新
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'deploying',
      },
    });

    try {
      // デプロイ処理の実行
      const deploymentResult = await DockerDeployService.deployProject(projectId);

      res.status(200).json({
        status: 'success',
        deployment: deploymentResult,
      });
    } catch (error) {
      // エラー時はプロジェクトのステータスを元に戻す
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'active',
        },
      });

      return next(new AppError('デプロイ中にエラーが発生しました', 500));
    }
  }
);

// デプロイメントのステータス取得
export const getDeploymentStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId, deploymentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // デプロイメントの取得
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
    });

    if (!deployment) {
      return next(new AppError('デプロイメントが見つかりません', 404));
    }

    // プロジェクトIDの確認
    if (deployment.projectId !== projectId) {
      return next(new AppError('このプロジェクトのデプロイメントではありません', 403));
    }

    res.status(200).json({
      status: 'success',
      deployment: {
        id: deployment.id,
        status: deployment.status,
        url: deployment.url,
        createdAt: deployment.createdAt,
        updatedAt: deployment.updatedAt,
      },
    });
  }
);

// デプロイメントのログ取得
export const getDeploymentLogs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId, deploymentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // デプロイメントの取得
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
    });

    if (!deployment) {
      return next(new AppError('デプロイメントが見つかりません', 404));
    }

    // プロジェクトIDの確認
    if (deployment.projectId !== projectId) {
      return next(new AppError('このプロジェクトのデプロイメントではありません', 403));
    }

    res.status(200).json({
      status: 'success',
      logs: deployment.logs || '',
    });
  }
);

// デプロイメント履歴の取得
export const getDeploymentHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
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

    // デプロイメント履歴の取得
    const deployments = await prisma.deployment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: 'success',
      results: deployments.length,
      deployments,
    });
  }
);