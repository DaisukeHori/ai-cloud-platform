import { Request, Response, NextFunction } from 'express';

// カスタムエラークラス
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// エラーハンドリングミドルウェア
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // AppErrorインスタンスかどうかを確認
  const error = err as AppError;
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // 開発環境ではスタックトレースを含める
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  }

  // 本番環境では運用上のエラーのみを返す
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  // プログラミングエラーや未知のエラーの場合は詳細を隠す
  console.error('ERROR 💥', error);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

// 非同期関数のエラーをキャッチするためのラッパー
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};