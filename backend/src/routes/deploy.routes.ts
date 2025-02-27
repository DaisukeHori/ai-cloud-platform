import express from 'express';
import * as deployController from '../controllers/deploy.controller';
import { projectAccessMiddleware } from '../middlewares/auth.middleware';

const router = express.Router({ mergeParams: true });

// デプロイルート
router.post('/', projectAccessMiddleware, deployController.deployProject);
router.get('/status/:deploymentId', projectAccessMiddleware, deployController.getDeploymentStatus);
router.get('/logs/:deploymentId', projectAccessMiddleware, deployController.getDeploymentLogs);
router.get('/history', projectAccessMiddleware, deployController.getDeploymentHistory);

export default router;