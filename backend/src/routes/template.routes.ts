import express from 'express';
import { body } from 'express-validator';
import * as templateController from '../controllers/template.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// テンプレート一覧の取得
router.get('/', templateController.getTemplates);

// テンプレート詳細の取得
router.get('/:templateId', templateController.getTemplateDetails);

// テンプレートからプロジェクトを作成
router.post(
  '/create-project',
  authMiddleware,
  [
    body('templateId').notEmpty().withMessage('テンプレートIDは必須です'),
    body('projectName')
      .notEmpty()
      .withMessage('プロジェクト名は必須です')
      .isLength({ min: 2, max: 50 })
      .withMessage('プロジェクト名は2〜50文字である必要があります'),
    body('description').optional().isString(),
  ],
  validateRequest,
  templateController.createProjectFromTemplate
);

export default router;