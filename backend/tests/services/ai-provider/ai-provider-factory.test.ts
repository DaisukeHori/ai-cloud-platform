import { AIProviderFactory } from '../../../src/services/ai-provider/ai-provider-factory';
import { OpenAIProvider } from '../../../src/services/ai-provider/openai-provider';
import { AnthropicProvider } from '../../../src/services/ai-provider/anthropic-provider';
import { OpenRouterProvider } from '../../../src/services/ai-provider/openrouter-provider';
import { AWSBedrockProvider } from '../../../src/services/ai-provider/aws-bedrock-provider';
import { AppError } from '../../../src/middlewares/error.middleware';

// Anthropicのモックインスタンス
const mockAnthropicMessages = {
  create: jest.fn().mockResolvedValue({
    content: [
      {
        type: 'text',
        text: 'モックされたAI応答',
      },
    ],
  }),
};

// Anthropicコンストラクタのモック
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true, default: jest.fn().mockImplementation(() => ({ messages: mockAnthropicMessages })),
  };
});

describe('AIProviderFactory', () => {
  describe('createProvider', () => {
    it('should create an OpenAI provider', () => {
      const config = {
        providerId: 'openai',
        apiKey: 'test-api-key',
        organizationId: 'test-org-id',
        defaultModelId: 'gpt-4-turbo',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4000,
      };

      const provider = AIProviderFactory.createProvider(config);
      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should create an Anthropic provider', () => {
      const config = {
        providerId: 'anthropic',
        apiKey: 'test-api-key',
        defaultModelId: 'claude-3-sonnet',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4000,
      };

      const provider = AIProviderFactory.createProvider(config);
      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('should create an OpenRouter provider', () => {
      const config = {
        providerId: 'openrouter',
        apiKey: 'test-api-key',
        defaultModelId: 'anthropic/claude-3-sonnet',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4000,
      };

      const provider = AIProviderFactory.createProvider(config);
      expect(provider).toBeInstanceOf(OpenRouterProvider);
    });

    it('should create an AWS Bedrock provider', () => {
      const config = {
        providerId: 'aws-bedrock',
        apiKey: 'test-access-key:test-secret-key',
        endpoint: 'us-east-1',
        defaultModelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4000,
      };

      const provider = AIProviderFactory.createProvider(config);
      expect(provider).toBeInstanceOf(AWSBedrockProvider);
    });

    it('should throw an error for invalid provider ID', () => {
      const config = {
        providerId: 'invalid-provider',
        apiKey: 'test-api-key',
      };

      expect(() => AIProviderFactory.createProvider(config)).toThrow(AppError);
      expect(() => AIProviderFactory.createProvider(config)).toThrow('未対応のAIプロバイダー');
    });

    it('should throw an error for invalid AWS Bedrock credentials', () => {
      const config = {
        providerId: 'aws-bedrock',
        apiKey: 'invalid-format',
        endpoint: 'us-east-1',
      };

      expect(() => AIProviderFactory.createProvider(config)).toThrow(AppError);
      expect(() => AIProviderFactory.createProvider(config)).toThrow('AWS Bedrockの認証情報が不正です');
    });
  });

  describe('getAvailableProviders', () => {
    it('should return a list of available providers', () => {
      const providers = AIProviderFactory.getAvailableProviders();
      expect(providers).toEqual([
        { id: 'openai', name: 'OpenAI' },
        { id: 'anthropic', name: 'Anthropic Claude' },
        { id: 'openrouter', name: 'OpenRouter' },
        { id: 'aws-bedrock', name: 'AWS Bedrock' },
      ]);
    });
  });

  describe('getDefaultConfig', () => {
    it('should return default config for OpenAI', () => {
      const config = AIProviderFactory.getDefaultConfig('openai');
      expect(config).toEqual({
        providerId: 'openai',
        defaultModelId: 'gpt-4-turbo',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4000,
      });
    });

    it('should return default config for Anthropic', () => {
      const config = AIProviderFactory.getDefaultConfig('anthropic');
      expect(config).toEqual({
        providerId: 'anthropic',
        defaultModelId: 'claude-3-sonnet',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4000,
      });
    });

    it('should return default config for OpenRouter', () => {
      const config = AIProviderFactory.getDefaultConfig('openrouter');
      expect(config).toEqual({
        providerId: 'openrouter',
        defaultModelId: 'anthropic/claude-3-sonnet',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4000,
      });
    });

    it('should return default config for AWS Bedrock', () => {
      const config = AIProviderFactory.getDefaultConfig('aws-bedrock');
      expect(config).toEqual({
        providerId: 'aws-bedrock',
        defaultModelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        defaultTemperature: 0.7,
        defaultMaxTokens: 4000,
        endpoint: 'us-east-1',
      });
    });

    it('should throw an error for invalid provider ID', () => {
      expect(() => AIProviderFactory.getDefaultConfig('invalid-provider')).toThrow(AppError);
      expect(() => AIProviderFactory.getDefaultConfig('invalid-provider')).toThrow('未対応のAIプロバイダー');
    });
  });
});