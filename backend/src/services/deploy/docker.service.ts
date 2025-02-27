import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middlewares/error.middleware';
import { prisma } from '../../index';
import { io } from '../../index';

/**
 * Dockerデプロイサービス
 * プロジェクトをDockerコンテナにデプロイする
 */
export class DockerDeployService {
  /**
   * プロジェクトをデプロイ
   * @param projectId プロジェクトID
   * @returns デプロイ情報
   */
  static async deployProject(projectId: string): Promise<DeploymentResult> {
    try {
      // デプロイレコードの作成
      const deployment = await prisma.deployment.create({
        data: {
          status: 'pending',
          projectId,
        },
      });

      // プロジェクト情報の取得
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }

      // プロジェクトのファイル取得
      const files = await prisma.projectFile.findMany({
        where: { projectId },
      });

      // 一時ディレクトリの作成
      const deployDir = path.join(process.cwd(), 'deploy', projectId, uuidv4());
      await fs.mkdir(deployDir, { recursive: true });

      // ファイルの書き込み
      for (const file of files) {
        if (file.type === 'file') {
          const filePath = path.join(deployDir, file.path);
          const dirPath = path.dirname(filePath);
          await fs.mkdir(dirPath, { recursive: true });
          await fs.writeFile(filePath, file.content);
        }
      }

      // プロジェクトタイプの検出
      const projectType = this.detectProjectType(files);

      // Dockerfileの生成
      const dockerfilePath = path.join(deployDir, 'Dockerfile');
      await fs.writeFile(dockerfilePath, this.generateDockerfile(projectType));

      // docker-compose.ymlの生成
      const dockerComposePath = path.join(deployDir, 'docker-compose.yml');
      const containerName = `ai-cloud-${projectId.substring(0, 8)}`;
      const port = 3000 + Math.floor(Math.random() * 1000); // ランダムなポート番号
      await fs.writeFile(
        dockerComposePath,
        this.generateDockerCompose(containerName, port)
      );

      // デプロイ処理の実行（非同期）
      this.executeDeployment(deployDir, deployment.id, containerName, port, projectId);

      return {
        deploymentId: deployment.id,
        status: 'pending',
        message: 'デプロイを開始しました',
      };
    } catch (error) {
      console.error('Deployment error:', error);
      throw new AppError('デプロイ中にエラーが発生しました', 500);
    }
  }

  /**
   * デプロイ処理の実行
   * @param deployDir デプロイディレクトリ
   * @param deploymentId デプロイメントID
   * @param containerName コンテナ名
   * @param port ポート番号
   * @param projectId プロジェクトID
   */
  private static async executeDeployment(
    deployDir: string,
    deploymentId: string,
    containerName: string,
    port: number,
    projectId: string
  ): Promise<void> {
    try {
      // ログ配列
      const logs: string[] = [];
      const addLog = (log: string) => {
        logs.push(log);
        // WebSocketでログを送信
        io.to(`project-${projectId}`).emit('console-output', { output: log });
      };

      addLog(`デプロイを開始します: ${new Date().toISOString()}`);
      addLog(`コンテナ名: ${containerName}`);
      addLog(`ポート: ${port}`);

      // Docker Composeビルド
      addLog('Docker Composeビルドを実行中...');
      await this.execCommand(`cd ${deployDir} && docker-compose build`, addLog);

      // 既存のコンテナを停止・削除
      addLog('既存のコンテナを停止・削除中...');
      await this.execCommand(`docker stop ${containerName} || true`, addLog);
      await this.execCommand(`docker rm ${containerName} || true`, addLog);

      // Docker Compose起動
      addLog('Docker Compose起動中...');
      await this.execCommand(`cd ${deployDir} && docker-compose up -d`, addLog);

      // デプロイ成功
      addLog('デプロイが完了しました！');
      const deployUrl = `http://localhost:${port}`;
      addLog(`アプリケーションURL: ${deployUrl}`);

      // デプロイメントレコードの更新
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'success',
          logs: logs.join('\n'),
          url: deployUrl,
        },
      });

      // プロジェクトのステータスとURLを更新
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'active',
          deployedUrl: deployUrl,
        },
      });

      // WebSocketでデプロイ成功を通知
      io.to(`project-${projectId}`).emit('deployment-status', {
        status: 'success',
        url: deployUrl,
      });
    } catch (error) {
      console.error('Deployment execution error:', error);

      // デプロイメントレコードの更新
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'failed',
          logs: `デプロイ中にエラーが発生しました: ${error}`,
        },
      });

      // プロジェクトのステータスを更新
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'active', // エラーでもactiveに戻す
        },
      });

      // WebSocketでデプロイ失敗を通知
      io.to(`project-${projectId}`).emit('deployment-status', {
        status: 'error',
        message: 'デプロイに失敗しました',
      });
    }
  }

  /**
   * コマンド実行
   * @param command コマンド
   * @param logCallback ログコールバック
   * @returns 実行結果
   */
  private static execCommand(
    command: string,
    logCallback?: (log: string) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (logCallback) {
          if (stdout) logCallback(stdout);
          if (stderr) logCallback(`ERROR: ${stderr}`);
        }

        if (error) {
          reject(error);
          return;
        }

        resolve(stdout);
      });
    });
  }

  /**
   * プロジェクトタイプの検出
   * @param files プロジェクトファイル
   * @returns プロジェクトタイプ
   */
  private static detectProjectType(files: any[]): ProjectType {
    // package.jsonの存在確認
    const packageJson = files.find(
      (file) => file.path === '/package.json' || file.path === 'package.json'
    );

    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson.content);
        
        // Reactの依存関係を確認
        if (pkg.dependencies?.react) {
          return 'react';
        }
        
        // Expressの依存関係を確認
        if (pkg.dependencies?.express) {
          return 'node';
        }
        
        // その他のNode.jsプロジェクト
        return 'node';
      } catch (e) {
        // JSONパースエラー
      }
    }

    // requirements.txtの存在確認
    const requirementsTxt = files.find(
      (file) => file.path === '/requirements.txt' || file.path === 'requirements.txt'
    );

    if (requirementsTxt) {
      return 'python';
    }

    // index.htmlの存在確認
    const indexHtml = files.find(
      (file) => file.path === '/index.html' || file.path === 'index.html'
    );

    if (indexHtml) {
      return 'static';
    }

    // デフォルトはstatic
    return 'static';
  }

  /**
   * Dockerfileの生成
   * @param projectType プロジェクトタイプ
   * @returns Dockerfile内容
   */
  private static generateDockerfile(projectType: ProjectType): string {
    switch (projectType) {
      case 'react':
        return `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]`;

      case 'node':
        return `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]`;

      case 'python':
        return `FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 3000
CMD ["python", "app.py"]`;

      case 'static':
      default:
        return `FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;
    }
  }

  /**
   * docker-compose.ymlの生成
   * @param containerName コンテナ名
   * @param port ポート番号
   * @returns docker-compose.yml内容
   */
  private static generateDockerCompose(containerName: string, port: number): string {
    return `version: '3'
services:
  app:
    container_name: ${containerName}
    build: .
    ports:
      - "${port}:3000"
    restart: unless-stopped`;
  }
}

/**
 * プロジェクトタイプ
 */
type ProjectType = 'react' | 'node' | 'python' | 'static';

/**
 * デプロイ結果
 */
interface DeploymentResult {
  deploymentId: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  url?: string;
}