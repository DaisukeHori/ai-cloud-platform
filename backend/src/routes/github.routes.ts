import express from 'express';
import { body } from 'express-validator';
import * as githubController from '../controllers/github.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authMiddleware, projectAccessMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// GitHub認証ルート
router.get('/auth/callback', githubController.handleAuthCallback);
router.post('/auth/token', authMiddleware, githubController.saveAccessToken);
router.get('/auth/status', authMiddleware, githubController.getAuthStatus);

// GitHub連携ルート
router.post(
  '/sync/:projectId',
  authMiddleware,
  projectAccessMiddleware,
  [
    body('repoName').optional().isString(),
    body('isPrivate').optional().isBoolean(),
  ],
  validateRequest,
  githubController.syncProject
);

router.get(
  '/repos',
  authMiddleware,
  githubController.getRepositories
);

router.post(
  '/pull-request/:projectId',
  authMiddleware,
  projectAccessMiddleware,
  [
    body('title').notEmpty().withMessage('タイトルは必須です'),
    body('description').optional().isString(),
    body('branch').optional().isString(),
  ],
  validateRequest,
  githubController.createPullRequest
);

export default router;