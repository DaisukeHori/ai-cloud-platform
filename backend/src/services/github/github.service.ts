import axios from 'axios';
import { AppError } from '../../middlewares/error.middleware';
import { prisma } from '../../index';

/**
 * GitHub連携サービス
 * GitHubリポジトリとの連携機能を提供
 */
export class GitHubService {
  private static readonly API_BASE_URL = 'https://api.github.com';
  
  /**
   * リポジトリの作成
   * @param accessToken GitHubアクセストークン
   * @param repoName リポジトリ名
   * @param description 説明
   * @param isPrivate プライベートリポジトリかどうか
   * @returns 作成されたリポジトリ情報
   */
  static async createRepository(
    accessToken: string,
    repoName: string,
    description: string = '',
    isPrivate: boolean = true
  ): Promise<GitHubRepository> {
    try {
      const response = await axios.post(
        `${this.API_BASE_URL}/user/repos`,
        {
          name: repoName,
          description,
          private: isPrivate,
          auto_init: true,
        },
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      return {
        id: response.data.id,
        name: response.data.name,
        fullName: response.data.full_name,
        htmlUrl: response.data.html_url,
        cloneUrl: response.data.clone_url,
        private: response.data.private,
      };
    } catch (error) {
      console.error('GitHub repository creation error:', error);
      throw new AppError('GitHubリポジトリの作成に失敗しました', 500);
    }
  }

  /**
   * リポジトリへのファイルのプッシュ
   * @param accessToken GitHubアクセストークン
   * @param repoFullName リポジトリのフルネーム (owner/repo)
   * @param files プッシュするファイル
   * @param branch ブランチ名
   * @param commitMessage コミットメッセージ
   * @returns コミット情報
   */
  static async pushFiles(
    accessToken: string,
    repoFullName: string,
    files: GitHubFile[],
    branch: string = 'main',
    commitMessage: string = 'Update files'
  ): Promise<GitHubCommit> {
    try {
      // 現在のコミットSHAを取得
      const refResponse = await axios.get(
        `${this.API_BASE_URL}/repos/${repoFullName}/git/refs/heads/${branch}`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      
      const currentCommitSha = refResponse.data.object.sha;
      
      // 現在のツリーを取得
      const commitResponse = await axios.get(
        `${this.API_BASE_URL}/repos/${repoFullName}/git/commits/${currentCommitSha}`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      
      const currentTreeSha = commitResponse.data.tree.sha;
      
      // 新しいツリーを作成
      const treeItems = await Promise.all(
        files.map(async (file) => {
          // ファイルのBlobを作成
          const blobResponse = await axios.post(
            `${this.API_BASE_URL}/repos/${repoFullName}/git/blobs`,
            {
              content: Buffer.from(file.content).toString('base64'),
              encoding: 'base64',
            },
            {
              headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
              },
            }
          );
          
          return {
            path: file.path,
            mode: '100644', // 通常のファイル
            type: 'blob',
            sha: blobResponse.data.sha,
          };
        })
      );
      
      // 新しいツリーを作成
      const newTreeResponse = await axios.post(
        `${this.API_BASE_URL}/repos/${repoFullName}/git/trees`,
        {
          base_tree: currentTreeSha,
          tree: treeItems,
        },
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      
      const newTreeSha = newTreeResponse.data.sha;
      
      // 新しいコミットを作成
      const newCommitResponse = await axios.post(
        `${this.API_BASE_URL}/repos/${repoFullName}/git/commits`,
        {
          message: commitMessage,
          tree: newTreeSha,
          parents: [currentCommitSha],
        },
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      
      const newCommitSha = newCommitResponse.data.sha;
      
      // リファレンスを更新
      await axios.patch(
        `${this.API_BASE_URL}/repos/${repoFullName}/git/refs/heads/${branch}`,
        {
          sha: newCommitSha,
          force: false,
        },
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      
      return {
        sha: newCommitSha,
        message: commitMessage,
        htmlUrl: `https://github.com/${repoFullName}/commit/${newCommitSha}`,
      };
    } catch (error) {
      console.error('GitHub push files error:', error);
      throw new AppError('GitHubリポジトリへのファイルのプッシュに失敗しました', 500);
    }
  }

  /**
   * プロジェクトをGitHubリポジトリに同期
   * @param projectId プロジェクトID
   * @param accessToken GitHubアクセストークン
   * @param repoName リポジトリ名（指定がない場合はプロジェクト名を使用）
   * @param isPrivate プライベートリポジトリかどうか
   * @returns 同期結果
   */
  static async syncProjectToGitHub(
    projectId: string,
    accessToken: string,
    repoName?: string,
    isPrivate: boolean = true
  ): Promise<GitHubSyncResult> {
    try {
      // プロジェクト情報の取得
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }

      // リポジトリ名の決定
      const repositoryName = repoName || `ai-cloud-${project.name.toLowerCase().replace(/\s+/g, '-')}`;

      // リポジトリの作成
      const repository = await this.createRepository(
        accessToken,
        repositoryName,
        project.description || `AI Cloud Development Platform - ${project.name}`,
        isPrivate
      );

      // プロジェクトのファイル取得
      const projectFiles = await prisma.projectFile.findMany({
        where: { projectId, type: 'file' },
      });

      // GitHubファイルの作成
      const githubFiles: GitHubFile[] = projectFiles.map((file) => ({
        path: file.path.startsWith('/') ? file.path.substring(1) : file.path,
        content: file.content,
      }));

      // ファイルのプッシュ
      const commit = await this.pushFiles(
        accessToken,
        repository.fullName,
        githubFiles,
        'main',
        'Initial commit from AI Cloud Development Platform'
      );

      return {
        repository,
        commit,
      };
    } catch (error) {
      console.error('GitHub sync error:', error);
      throw new AppError('GitHubリポジトリへの同期に失敗しました', 500);
    }
  }

  /**
   * ユーザー情報の取得
   * @param accessToken GitHubアクセストークン
   * @returns ユーザー情報
   */
  static async getUserInfo(accessToken: string): Promise<GitHubUser> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/user`, {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      return {
        id: response.data.id,
        login: response.data.login,
        name: response.data.name,
        avatarUrl: response.data.avatar_url,
        htmlUrl: response.data.html_url,
      };
    } catch (error) {
      console.error('GitHub user info error:', error);
      throw new AppError('GitHubユーザー情報の取得に失敗しました', 500);
    }
  }
}

/**
 * GitHubリポジトリ情報
 */
interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  cloneUrl: string;
  private: boolean;
}

/**
 * GitHubファイル
 */
interface GitHubFile {
  path: string;
  content: string;
}

/**
 * GitHubコミット情報
 */
interface GitHubCommit {
  sha: string;
  message: string;
  htmlUrl: string;
}

/**
 * GitHubユーザー情報
 */
interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatarUrl: string;
  htmlUrl: string;
}

/**
 * GitHub同期結果
 */
interface GitHubSyncResult {
  repository: GitHubRepository;
  commit: GitHubCommit;
}