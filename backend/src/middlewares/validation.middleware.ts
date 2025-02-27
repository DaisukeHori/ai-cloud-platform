import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './error.middleware';

/**
 * リクエストのバリデーションを行うミドルウェア
 * express-validatorを使用してバリデーションを行い、エラーがあればエラーレスポンスを返す
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // バリデーションエラーの整形
    const errorMessages = errors.array().map(error => {
      return {
        field: error.path,
        message: error.msg
      };
    });
    
    // 最初のエラーメッセージを取得
    const firstError = errors.array()[0];
    const message = `${firstError.path}: ${firstError.msg}`;
    
    return next(new AppError(message, 400));
  }
  
  next();
};