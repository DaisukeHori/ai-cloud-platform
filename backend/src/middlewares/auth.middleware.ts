import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { AppError } from './error.middleware';

// JWTペイロードの型定義
interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// リクエストにユーザー情報を追加するための型拡張
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

// 認証ミドルウェア
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // トークンの取得
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // トークンがない場合
    if (!token) {
      return next(
        new AppError('認証が必要です。ログインしてください。', 401)
      );
    }

    // トークンの検証
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return next(
        new AppError('このトークンに関連するユーザーが存在しません。', 401)
      );
    }

    // リクエストにユーザー情報を追加
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('無効なトークンです。再度ログインしてください。', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('トークンの有効期限が切れています。再度ログインしてください。', 401));
    }
    next(error);
  }
};

// プロジェクト所有者または共同作業者のみアクセス可能なミドルウェア
export const projectAccessMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です。', 401));
    }

    // プロジェクトの所有者かどうかを確認
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return next(new AppError('プロジェクトが見つかりません。', 404));
    }

    // プロジェクトの所有者または共同作業者かどうかを確認
    if (project.userId !== userId) {
      // 共同作業者かどうかを確認
      const collaborator = await prisma.projectCollaborator.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });

      if (!collaborator) {
        return next(
          new AppError('このプロジェクトへのアクセス権限がありません。', 403)
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// 管理者のみアクセス可能なミドルウェア（将来的な拡張用）
export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ユーザーが管理者かどうかを確認するロジックを追加
    // 現在は実装されていないため、すべてのリクエストを拒否
    return next(new AppError('管理者権限が必要です。', 403));
  } catch (error) {
    next(error);
  }
};