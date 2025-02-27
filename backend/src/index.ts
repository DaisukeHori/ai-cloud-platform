import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// ルートのインポート
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import fileRoutes from './routes/file.routes';
import deployRoutes from './routes/deploy.routes';
import chatRoutes from './routes/chat.routes';
import githubRoutes from './routes/github.routes';
import templateRoutes from './routes/template.routes';

// ミドルウェアのインポート
import { errorHandler } from './middlewares/error.middleware';
import { authMiddleware } from './middlewares/auth.middleware';

// 設定のロード
dotenv.config();

// Prismaクライアントの初期化
export const prisma = new PrismaClient();

// Expressアプリケーションの作成
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ミドルウェアの設定
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/projects/:projectId/files', authMiddleware, fileRoutes);
app.use('/api/projects/:projectId/deploy', authMiddleware, deployRoutes);
app.use('/api/projects/:projectId/chat', authMiddleware, chatRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/templates', templateRoutes);

// エラーハンドリングミドルウェア
app.use(errorHandler);

// WebSocketの設定
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join', ({ projectId }) => {
    socket.join(`project-${projectId}`);
    console.log(`Client joined project: ${projectId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// グローバルなSocket.IOインスタンスをエクスポート
export { io };

// サーバーの起動
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 未処理のエラーハンドリング
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});