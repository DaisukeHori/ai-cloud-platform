import { AIProvider, AIProviderConfig } from './ai-provider.interface';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { OpenRouterProvider } from './openrouter-provider';
import { AWSBedrockProvider } from './aws-bedrock-provider';
import { AppError } from '../../middlewares/error.middleware';

/**
 * AIプロバイダーファクトリー
 * 設定に基づいて適切なAIプロバイダーのインスタンスを生成する
 */
export class AIProviderFactory {
  /**
   * AIプロバイダーの作成
   * @param config AIプロバイダー設定
   * @returns AIプロバイダーインスタンス
   */
  static createProvider(config: AIProviderConfig): AIProvider {
    switch (config.providerId) {
      case 'openai':
        return new OpenAIProvider(
          config.apiKey,
          config.organizationId,
          config.defaultModelId,
          config.defaultTemperature,
          config.defaultMaxTokens
        );
      case 'anthropic':
        return new AnthropicProvider(
          config.apiKey,
          config.defaultModelId,
          config.defaultTemperature,
          config.defaultMaxTokens
        );
      case 'openrouter':
        return new OpenRouterProvider(
          config.apiKey,
          config.defaultModelId,
          config.defaultTemperature,
          config.defaultMaxTokens
        );
      case 'aws-bedrock':
        // AWS Bedrockの場合、APIキーはアクセスキーIDとシークレットアクセスキーの組み合わせ
        const [accessKeyId, secretAccessKey] = config.apiKey.split(':');
        if (!accessKeyId || !secretAccessKey) {
          throw new AppError('AWS Bedrockの認証情報が不正です。形式: "アクセスキーID:シークレットアクセスキー"', 400);
        }
        return new AWSBedrockProvider(
          accessKeyId,
          secretAccessKey,
          config.endpoint || 'us-east-1', // エンドポイントがない場合はリージョンとして扱う
          config.defaultModelId,
          config.defaultTemperature,
          config.defaultMaxTokens
        );
      default:
        throw new AppError(`未対応のAIプロバイダー: ${config.providerId}`, 400);
    }
  }

  /**
   * 利用可能なプロバイダー一覧の取得
   * @returns 利用可能なプロバイダー一覧
   */
  static getAvailableProviders(): { id: string; name: string }[] {
    return [
      { id: 'openai', name: 'OpenAI' },
      { id: 'anthropic', name: 'Anthropic Claude' },
      { id: 'openrouter', name: 'OpenRouter' },
      { id: 'aws-bedrock', name: 'AWS Bedrock' },
    ];
  }

  /**
   * プロバイダーのデフォルト設定の取得
   * @param providerId プロバイダーID
   * @returns デフォルト設定
   */
  static getDefaultConfig(providerId: string): Partial<AIProviderConfig> {
    switch (providerId) {
      case 'openai':
        return {
          providerId: 'openai',
          defaultModelId: 'gpt-4-turbo',
          defaultTemperature: 0.7,
          defaultMaxTokens: 4000,
        };
      case 'anthropic':
        return {
          providerId: 'anthropic',
          defaultModelId: 'claude-3-sonnet',
          defaultTemperature: 0.7,
          defaultMaxTokens: 4000,
        };
      case 'openrouter':
        return {
          providerId: 'openrouter',
          defaultModelId: 'anthropic/claude-3-sonnet',
          defaultTemperature: 0.7,
          defaultMaxTokens: 4000,
        };
      case 'aws-bedrock':
        return {
          providerId: 'aws-bedrock',
          defaultModelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
          defaultTemperature: 0.7,
          defaultMaxTokens: 4000,
          endpoint: 'us-east-1', // デフォルトリージョン
        };
      default:
        throw new AppError(`未対応のAIプロバイダー: ${providerId}`, 400);
    }
  }
}