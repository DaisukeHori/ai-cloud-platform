import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { prisma } from '../index';
import { AppError, catchAsync } from '../middlewares/error.middleware';
import { GitHubService } from '../services/github/github.service';

// GitHub認証コールバック処理
export const handleAuthCallback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.query;
    
    if (!code) {
      return next(new AppError('認証コードがありません', 400));
    }
    
    try {
      // GitHubからアクセストークンを取得
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );
      
      const { access_token } = tokenResponse.data;
      
      if (!access_token) {
        return next(new AppError('アクセストークンの取得に失敗しました', 400));
      }
      
      // フロントエンドにリダイレクト（トークンをクエリパラメータとして渡す）
      res.redirect(`${process.env.FRONTEND_URL}/github/callback?token=${access_token}`);
    } catch (error) {
      console.error('GitHub auth error:', error);
      return next(new AppError('GitHub認証中にエラーが発生しました', 500));
    }
  }
);

// アクセストークンの保存
export const saveAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }
    
    if (!token) {
      return next(new AppError('トークンが必要です', 400));
    }
    
    try {
      // GitHubユーザー情報の取得
      const githubUser = await GitHubService.getUserInfo(token);
      
      // ユーザーのGitHub情報を更新
      // 注意: Prismaスキーマにこれらのフィールドを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      await prisma.user.update({
        where: { id: userId },
        data: {
          githubId: githubUser.id.toString(),
          githubUsername: githubUser.login,
          githubAccessToken: token,
        },
      });
      */
      
      // 実際の実装では上記のコメントアウトを解除し、適切なスキーマを使用してください
      
      res.status(200).json({
        status: 'success',
        message: 'GitHubアクセストークンを保存しました',
        githubUser,
      });
    } catch (error) {
      console.error('GitHub token save error:', error);
      return next(new AppError('GitHubトークンの保存中にエラーが発生しました', 500));
    }
  }
);

// 認証状態の取得
export const getAuthStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }
    
    try {
      // ユーザーのGitHub情報を取得
      // 注意: Prismaスキーマにこれらのフィールドを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          githubId: true,
          githubUsername: true,
          githubAccessToken: true,
        },
      });
      
      const isConnected = !!user?.githubAccessToken;
      */
      
      // 実装が完了していないため、仮の値を返す
      const isConnected = false;
      const githubUsername = null;
      
      res.status(200).json({
        status: 'success',
        isConnected,
        githubUsername,
      });
    } catch (error) {
      console.error('GitHub auth status error:', error);
      return next(new AppError('GitHub認証状態の取得中にエラーが発生しました', 500));
    }
  }
);

// プロジェクトをGitHubと同期
export const syncProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const { repoName, isPrivate } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }
    
    try {
      // ユーザーのGitHubアクセストークンを取得
      // 注意: Prismaスキーマにこれらのフィールドを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          githubAccessToken: true,
        },
      });
      
      if (!user?.githubAccessToken) {
        return next(new AppError('GitHubアカウントが連携されていません', 400));
      }
      
      const accessToken = user.githubAccessToken;
      */
      
      // 実装が完了していないため、エラーを返す
      return next(new AppError('この機能は現在実装されていません', 501));
      
      // 実際の実装では以下のようになります
      /*
      // プロジェクトをGitHubと同期
      const syncResult = await GitHubService.syncProjectToGitHub(
        projectId,
        accessToken,
        repoName,
        isPrivate
      );
      
      // プロジェクトのGitHub情報を更新
      await prisma.project.update({
        where: { id: projectId },
        data: {
          githubRepoId: syncResult.repository.id.toString(),
          githubRepoName: syncResult.repository.fullName,
          githubRepoUrl: syncResult.repository.htmlUrl,
        },
      });
      
      res.status(200).json({
        status: 'success',
        message: 'プロジェクトをGitHubと同期しました',
        repository: syncResult.repository,
        commit: syncResult.commit,
      });
      */
    } catch (error) {
      console.error('GitHub sync error:', error);
      return next(new AppError('GitHubとの同期中にエラーが発生しました', 500));
    }
  }
);

// リポジトリ一覧の取得
export const getRepositories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }
    
    try {
      // ユーザーのGitHubアクセストークンを取得
      // 注意: Prismaスキーマにこれらのフィールドを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          githubAccessToken: true,
        },
      });
      
      if (!user?.githubAccessToken) {
        return next(new AppError('GitHubアカウントが連携されていません', 400));
      }
      
      // GitHubからリポジトリ一覧を取得
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: {
          Authorization: `token ${user.githubAccessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          sort: 'updated',
          per_page: 100,
        },
      });
      
      const repositories = response.data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        htmlUrl: repo.html_url,
        description: repo.description,
        private: repo.private,
        updatedAt: repo.updated_at,
      }));
      */
      
      // 実装が完了していないため、仮の値を返す
      const repositories: any[] = [];
      
      res.status(200).json({
        status: 'success',
        repositories,
      });
    } catch (error) {
      console.error('GitHub repositories error:', error);
      return next(new AppError('GitHubリポジトリの取得中にエラーが発生しました', 500));
    }
  }
);

// プルリクエストの作成
export const createPullRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const { title, description, branch } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }
    
    try {
      // プロジェクトのGitHub情報を取得
      // 注意: Prismaスキーマにこれらのフィールドを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          githubRepoName: true,
        },
      });
      
      if (!project?.githubRepoName) {
        return next(new AppError('このプロジェクトはGitHubと連携されていません', 400));
      }
      
      // ユーザーのGitHubアクセストークンを取得
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          githubAccessToken: true,
        },
      });
      
      if (!user?.githubAccessToken) {
        return next(new AppError('GitHubアカウントが連携されていません', 400));
      }
      
      // プルリクエストの作成
      const response = await axios.post(
        `https://api.github.com/repos/${project.githubRepoName}/pulls`,
        {
          title,
          body: description,
          head: branch || 'develop',
          base: 'main',
        },
        {
          headers: {
            Authorization: `token ${user.githubAccessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      
      const pullRequest = {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        htmlUrl: response.data.html_url,
        state: response.data.state,
      };
      */
      
      // 実装が完了していないため、エラーを返す
      return next(new AppError('この機能は現在実装されていません', 501));
      
      // 実際の実装では以下のようになります
      /*
      res.status(201).json({
        status: 'success',
        pullRequest,
      });
      */
    } catch (error) {
      console.error('GitHub pull request error:', error);
      return next(new AppError('GitHubプルリクエストの作成中にエラーが発生しました', 500));
    }
  }
);