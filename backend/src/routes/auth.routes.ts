import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';

const router = express.Router();

// 入力バリデーションルール
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('名前は必須です')
    .isLength({ min: 2, max: 50 })
    .withMessage('名前は2〜50文字である必要があります'),
  body('email')
    .notEmpty()
    .withMessage('メールアドレスは必須です')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('パスワードは必須です')
    .isLength({ min: 6 })
    .withMessage('パスワードは6文字以上である必要があります'),
];

const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('メールアドレスは必須です')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('パスワードは必須です'),
];

// 認証ルート
router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.login);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

export default router;