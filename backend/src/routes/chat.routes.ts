import express from 'express';
import { body } from 'express-validator';
import * as chatController from '../controllers/chat.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { projectAccessMiddleware } from '../middlewares/auth.middleware';

const router = express.Router({ mergeParams: true });

// 入力バリデーションルール
const messageValidation = [
  body('message')
    .notEmpty()
    .withMessage('メッセージは必須です')
    .isLength({ max: 5000 })
    .withMessage('メッセージは5000文字以内である必要があります'),
];

// チャット履歴の取得
router.get('/', projectAccessMiddleware, chatController.getChatHistory);

// メッセージの送信
router.post(
  '/',
  projectAccessMiddleware,
  messageValidation,
  validateRequest,
  chatController.sendMessage
);

// コード生成
router.post(
  '/generate-code',
  projectAccessMiddleware,
  [
    body('prompt')
      .notEmpty()
      .withMessage('プロンプトは必須です')
      .isLength({ max: 5000 })
      .withMessage('プロンプトは5000文字以内である必要があります'),
    body('language').optional().isString(),
    body('framework').optional().isString(),
  ],
  validateRequest,
  chatController.generateCode
);

// コード改善
router.post(
  '/improve-code',
  projectAccessMiddleware,
  [
    body('code')
      .notEmpty()
      .withMessage('コードは必須です'),
    body('instructions')
      .notEmpty()
      .withMessage('改善指示は必須です'),
  ],
  validateRequest,
  chatController.improveCode
);

// コード適用
router.post(
  '/apply-code',
  projectAccessMiddleware,
  [
    body('code')
      .notEmpty()
      .withMessage('コードは必須です'),
    body('path')
      .optional()
      .isString(),
  ],
  validateRequest,
  chatController.applyCode
);

export default router;