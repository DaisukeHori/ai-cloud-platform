import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../index';
import { AppError, catchAsync } from '../middlewares/error.middleware';

// JWTトークンの生成
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ユーザー登録
export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new AppError('このメールアドレスは既に使用されています', 400));
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // JWTトークンの生成
    const token = generateToken(user.id);

    // レスポンスの送信
    res.status(201).json({
      status: 'success',
      token,
      user,
    });
  }
);

// ログイン
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // ユーザーの検索
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new AppError('メールアドレスまたはパスワードが正しくありません', 401));
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(new AppError('メールアドレスまたはパスワードが正しくありません', 401));
    }

    // JWTトークンの生成
    const token = generateToken(user.id);

    // パスワードを除外したユーザー情報
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    // レスポンスの送信
    res.status(200).json({
      status: 'success',
      token,
      user: userWithoutPassword,
    });
  }
);

// 現在のユーザー情報の取得
export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 認証ミドルウェアでユーザー情報が設定されていない場合
    if (!req.user) {
      return next(new AppError('認証が必要です', 401));
    }

    // ユーザー情報の取得
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(new AppError('ユーザーが見つかりません', 404));
    }

    // レスポンスの送信
    res.status(200).json({
      status: 'success',
      user,
    });
  }
);

// ログアウト
export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // クライアント側でトークンを削除するだけなので、サーバー側では特に何もしない
    res.status(200).json({
      status: 'success',
      message: 'ログアウトしました',
    });
  }
);

// パスワードリセットトークンの生成
export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // ユーザーの検索
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new AppError('このメールアドレスのユーザーは存在しません', 404));
    }

    // パスワードリセットトークンの生成
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // パスワードリセットトークンの有効期限（10分）
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    // ユーザー情報の更新
    // 注意: Prismaスキーマにこれらのフィールドを追加する必要があります
    // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
    /*
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });
    */

    // 実際のアプリケーションではここでメール送信処理を行う
    // 今回はデモなので省略

    // レスポンスの送信
    res.status(200).json({
      status: 'success',
      message: 'パスワードリセットトークンを送信しました',
      resetToken, // 実際のアプリケーションでは送信しない
    });
  }
);

// パスワードのリセット
export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password } = req.body;

    // トークンのハッシュ化
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // トークンが有効なユーザーの検索
    // 注意: Prismaスキーマにこれらのフィールドを追加する必要があります
    // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
    /*
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return next(new AppError('トークンが無効または期限切れです', 400));
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザー情報の更新
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    */

    // 実装が完了していないため、エラーを返す
    return next(new AppError('この機能は現在実装されていません', 501));

    // レスポンスの送信
    /*
    res.status(200).json({
      status: 'success',
      message: 'パスワードがリセットされました',
    });
    */
  }
);