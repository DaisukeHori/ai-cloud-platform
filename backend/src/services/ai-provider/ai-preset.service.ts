import { prisma } from '../../index';
import { AIPreset, AIProviderConfig } from './ai-provider.interface';
import { AppError } from '../../middlewares/error.middleware';
import { AIProviderFactory } from './ai-provider-factory';

/**
 * AIプリセットサービス
 * ユーザーのAI設定プリセットを管理する
 */
export class AIPresetService {
  /**
   * プリセット一覧の取得
   * @param userId ユーザーID
   * @returns プリセット一覧
   */
  static async getPresets(userId: string): Promise<AIPreset[]> {
    try {
      // ユーザーのプリセットを取得
      // 注意: Prismaスキーマにこれらのテーブルを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      const presets = await prisma.aiPreset.findMany({
        where: {
          OR: [
            { createdById: userId },
            { isShared: true },
          ],
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      
      return presets;
      */
      
      // 実装が完了していないため、仮のデータを返す
      return [
        {
          id: 'preset-1',
          name: 'コード生成 (標準)',
          description: '標準的なコード生成設定',
          providerId: 'openai',
          modelId: 'gpt-4-turbo',
          temperature: 0.7,
          maxTokens: 4000,
          systemPrompt: 'あなたは優秀なソフトウェアエンジニアです。ユーザーの要求に基づいて、高品質なコードを生成してください。',
          purpose: 'code-generation',
          createdById: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isShared: false,
        },
        {
          id: 'preset-2',
          name: 'コード最適化',
          description: 'パフォーマンスを重視したコード最適化設定',
          providerId: 'openai',
          modelId: 'gpt-4-turbo',
          temperature: 0.3,
          maxTokens: 4000,
          systemPrompt: 'あなたはパフォーマンス最適化の専門家です。提供されたコードのパフォーマンスを向上させる方法を提案してください。',
          purpose: 'code-improvement',
          createdById: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isShared: false,
        },
        {
          id: 'preset-3',
          name: 'ドキュメント生成',
          description: '詳細なドキュメント生成設定',
          providerId: 'anthropic',
          modelId: 'claude-3-sonnet',
          temperature: 0.5,
          maxTokens: 4000,
          systemPrompt: 'あなたは優秀なテクニカルライターです。提供されたコードに対する包括的なドキュメントを生成してください。',
          purpose: 'documentation',
          createdById: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isShared: false,
        },
      ];
    } catch (error) {
      console.error('Failed to get AI presets:', error);
      throw new AppError('AIプリセットの取得に失敗しました', 500);
    }
  }

  /**
   * プリセットの取得
   * @param presetId プリセットID
   * @param userId ユーザーID
   * @returns プリセット
   */
  static async getPreset(presetId: string, userId: string): Promise<AIPreset> {
    try {
      // プリセットを取得
      // 注意: Prismaスキーマにこれらのテーブルを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      const preset = await prisma.aiPreset.findUnique({
        where: { id: presetId },
      });
      
      if (!preset) {
        throw new AppError('プリセットが見つかりません', 404);
      }
      
      // アクセス権のチェック
      if (!preset.isShared && preset.createdById !== userId) {
        throw new AppError('このプリセットにアクセスする権限がありません', 403);
      }
      
      return preset;
      */
      
      // 実装が完了していないため、仮のデータを返す
      const presets = await this.getPresets(userId);
      const preset = presets.find(p => p.id === presetId);
      
      if (!preset) {
        throw new AppError('プリセットが見つかりません', 404);
      }
      
      return preset;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Failed to get AI preset:', error);
      throw new AppError('AIプリセットの取得に失敗しました', 500);
    }
  }

  /**
   * プリセットの作成
   * @param userId ユーザーID
   * @param preset プリセット情報
   * @returns 作成されたプリセット
   */
  static async createPreset(userId: string, preset: Omit<AIPreset, 'id' | 'createdById' | 'createdAt' | 'updatedAt'>): Promise<AIPreset> {
    try {
      // プロバイダーとモデルの検証
      const availableProviders = AIProviderFactory.getAvailableProviders();
      if (!availableProviders.some(p => p.id === preset.providerId)) {
        throw new AppError('無効なプロバイダーIDです', 400);
      }
      
      // プリセットの作成
      // 注意: Prismaスキーマにこれらのテーブルを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      const newPreset = await prisma.aiPreset.create({
        data: {
          ...preset,
          createdById: userId,
        },
      });
      
      return newPreset;
      */
      
      // 実装が完了していないため、仮のデータを返す
      const newPreset: AIPreset = {
        id: `preset-${Date.now()}`,
        ...preset,
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return newPreset;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Failed to create AI preset:', error);
      throw new AppError('AIプリセットの作成に失敗しました', 500);
    }
  }

  /**
   * プリセットの更新
   * @param presetId プリセットID
   * @param userId ユーザーID
   * @param preset 更新するプリセット情報
   * @returns 更新されたプリセット
   */
  static async updatePreset(presetId: string, userId: string, preset: Partial<Omit<AIPreset, 'id' | 'createdById' | 'createdAt' | 'updatedAt'>>): Promise<AIPreset> {
    try {
      // プリセットの存在確認
      const existingPreset = await this.getPreset(presetId, userId);
      
      // 所有者のみが更新可能
      if (existingPreset.createdById !== userId) {
        throw new AppError('このプリセットを更新する権限がありません', 403);
      }
      
      // プリセットの更新
      // 注意: Prismaスキーマにこれらのテーブルを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      const updatedPreset = await prisma.aiPreset.update({
        where: { id: presetId },
        data: {
          ...preset,
          updatedAt: new Date(),
        },
      });
      
      return updatedPreset;
      */
      
      // 実装が完了していないため、仮のデータを返す
      const updatedPreset: AIPreset = {
        ...existingPreset,
        ...preset,
        updatedAt: new Date(),
      };
      
      return updatedPreset;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Failed to update AI preset:', error);
      throw new AppError('AIプリセットの更新に失敗しました', 500);
    }
  }

  /**
   * プリセットの削除
   * @param presetId プリセットID
   * @param userId ユーザーID
   */
  static async deletePreset(presetId: string, userId: string): Promise<void> {
    try {
      // プリセットの存在確認
      const existingPreset = await this.getPreset(presetId, userId);
      
      // 所有者のみが削除可能
      if (existingPreset.createdById !== userId) {
        throw new AppError('このプリセットを削除する権限がありません', 403);
      }
      
      // プリセットの削除
      // 注意: Prismaスキーマにこれらのテーブルを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      await prisma.aiPreset.delete({
        where: { id: presetId },
      });
      */
      
      // 実装が完了していないため、何もしない
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Failed to delete AI preset:', error);
      throw new AppError('AIプリセットの削除に失敗しました', 500);
    }
  }

  /**
   * プリセットの共有設定を更新
   * @param presetId プリセットID
   * @param userId ユーザーID
   * @param isShared 共有設定
   * @returns 更新されたプリセット
   */
  static async updatePresetSharing(presetId: string, userId: string, isShared: boolean): Promise<AIPreset> {
    try {
      // プリセットの存在確認
      const existingPreset = await this.getPreset(presetId, userId);
      
      // 所有者のみが共有設定を更新可能
      if (existingPreset.createdById !== userId) {
        throw new AppError('このプリセットの共有設定を更新する権限がありません', 403);
      }
      
      // 共有設定の更新
      // 注意: Prismaスキーマにこれらのテーブルを追加する必要があります
      // 現在のスキーマには含まれていないため、実際の実装では調整が必要です
      /*
      const updatedPreset = await prisma.aiPreset.update({
        where: { id: presetId },
        data: {
          isShared,
          updatedAt: new Date(),
        },
      });
      
      return updatedPreset;
      */
      
      // 実装が完了していないため、仮のデータを返す
      const updatedPreset: AIPreset = {
        ...existingPreset,
        isShared,
        updatedAt: new Date(),
      };
      
      return updatedPreset;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Failed to update AI preset sharing:', error);
      throw new AppError('AIプリセットの共有設定の更新に失敗しました', 500);
    }
  }
}