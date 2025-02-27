import express from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { projectAccessMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// 入力バリデーションルール
const projectValidation = [
  body('name')
    .notEmpty()
    .withMessage('プロジェクト名は必須です')
    .isLength({ min: 2, max: 100 })
    .withMessage('プロジェクト名は2〜100文字である必要があります'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('説明は500文字以内である必要があります'),
];

// プロジェクトルート
router.get('/', projectController.getAllProjects);
router.post('/', projectValidation, validateRequest, projectController.createProject);
router.get('/:projectId', projectAccessMiddleware, projectController.getProject);
router.put(
  '/:projectId',
  projectAccessMiddleware,
  projectValidation,
  validateRequest,
  projectController.updateProject
);
router.delete('/:projectId', projectAccessMiddleware, projectController.deleteProject);

// プロジェクト共同作業者ルート
router.get(
  '/:projectId/collaborators',
  projectAccessMiddleware,
  projectController.getCollaborators
);
router.post(
  '/:projectId/collaborators',
  projectAccessMiddleware,
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('role')
    .isIn(['editor', 'viewer'])
    .withMessage('ロールは editor または viewer である必要があります'),
  validateRequest,
  projectController.addCollaborator
);
router.delete(
  '/:projectId/collaborators/:userId',
  projectAccessMiddleware,
  projectController.removeCollaborator
);

export default router;