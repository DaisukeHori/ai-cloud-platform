import { AWSBedrockProvider } from '../../../src/services/ai-provider/aws-bedrock-provider';
import { AppError } from '../../../src/middlewares/error.middleware';

// AWS Bedrockのモックを取得
const mockSend = jest.fn();

// モックを設定
jest.mock('@aws-sdk/client-bedrock-runtime', () => {
  const mockInvokeModelCommand = jest.fn();
  return {
    BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    InvokeModelCommand: mockInvokeModelCommand,
    __mockInvokeModelCommand: mockInvokeModelCommand
  };
});

const { InvokeModelCommand: mockInvokeModelCommand, __mockInvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
describe('AWSBedrockProvider', () => {
  let provider: AWSBedrockProvider;
  
  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
    
    // InvokeModelCommandのモック実装
    mockInvokeModelCommand.mockImplementation((params) => params);
    
    // テスト用のプロバイダーインスタンスを作成
    provider = new AWSBedrockProvider(
      'test-access-key',
      'test-secret-key',
      'us-east-1',
      'anthropic.claude-3-sonnet-20240229-v1:0',
      0.7,
      4000
    );
    
    // モックレスポンスの設定
    mockSend.mockResolvedValue({
      body: Buffer.from(
        JSON.stringify({
          content: [{ text: 'モックされたAI応答' }],
          generation: 'モックされたAI応答',
          results: [{ outputText: 'モックされたAI応答' }],
          generations: [{ text: 'モックされたAI応答' }],
        })
      ),
    });
  });
  
  describe('constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(provider.name).toBe('AWS Bedrock');
      expect(provider.id).toBe('aws-bedrock');
      expect(provider.availableModels.length).toBeGreaterThan(0);
    });
  });
  
  describe('generateCode', () => {
    it('should call AWS Bedrock API with correct parameters for Claude model', async () => {
      const prompt = 'Reactでカウンターコンポーネントを作成してください';
      const result = await provider.generateCode(prompt);
      
      expect(mockInvokeModelCommand).toHaveBeenCalledTimes(1);
      expect(mockInvokeModelCommand).toHaveBeenCalledWith({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        body: expect.any(String),
        contentType: 'application/json',
      });
      
      // リクエスト本文の検証
      const commandArg = mockInvokeModelCommand.mock.calls[0][0];
      const requestBody = JSON.parse(commandArg.body);
      
      expect(requestBody).toHaveProperty('anthropic_version', 'bedrock-2023-05-31');
      expect(requestBody).toHaveProperty('max_tokens', 4000);
      expect(requestBody).toHaveProperty('temperature', 0.7);
      expect(requestBody).toHaveProperty('messages');
      expect(requestBody.messages).toEqual([
        { role: 'system', content: expect.stringContaining('ソフトウェアエンジニア') },
        { role: 'user', content: prompt },
      ]);
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(result).toBe('モックされたAI応答');
    });
    
    it('should call AWS Bedrock API with correct parameters for Llama model', async () => {
      // Llamaモデルを使用するようにプロバイダーを設定
      provider = new AWSBedrockProvider(
        'test-access-key',
        'test-secret-key',
        'us-east-1',
        'meta.llama3-70b-instruct-v1:0',
        0.7,
        4000
      );
      
      const prompt = 'Reactでカウンターコンポーネントを作成してください';
      await provider.generateCode(prompt);
      
      // リクエスト本文の検証
      const commandArg = mockInvokeModelCommand.mock.calls[0][0];
      const requestBody = JSON.parse(commandArg.body);
      
      expect(requestBody).toHaveProperty('prompt');
      expect(requestBody.prompt).toContain('<system>');
      expect(requestBody.prompt).toContain('<user>');
      expect(requestBody).toHaveProperty('max_gen_len', 4000);
      expect(requestBody).toHaveProperty('temperature', 0.7);
    });
    
    it('should call AWS Bedrock API with correct parameters for Titan model', async () => {
      // Titanモデルを使用するようにプロバイダーを設定
      provider = new AWSBedrockProvider(
        'test-access-key',
        'test-secret-key',
        'us-east-1',
        'amazon.titan-text-express-v1',
        0.7,
        4000
      );
      
      const prompt = 'Reactでカウンターコンポーネントを作成してください';
      await provider.generateCode(prompt);
      
      // リクエスト本文の検証
      const commandArg = mockInvokeModelCommand.mock.calls[0][0];
      const requestBody = JSON.parse(commandArg.body);
      
      expect(requestBody).toHaveProperty('inputText');
      expect(requestBody.inputText).toContain('System:');
      expect(requestBody.inputText).toContain('User:');
      expect(requestBody).toHaveProperty('textGenerationConfig');
      expect(requestBody.textGenerationConfig).toHaveProperty('maxTokenCount', 4000);
      expect(requestBody.textGenerationConfig).toHaveProperty('temperature', 0.7);
    });
    
    it('should call AWS Bedrock API with correct parameters for Cohere model', async () => {
      // Cohereモデルを使用するようにプロバイダーを設定
      provider = new AWSBedrockProvider(
        'test-access-key',
        'test-secret-key',
        'us-east-1',
        'cohere.command-r-v1:0',
        0.7,
        4000
      );
      
      const prompt = 'Reactでカウンターコンポーネントを作成してください';
      await provider.generateCode(prompt);
      
      // リクエスト本文の検証
      const commandArg = mockInvokeModelCommand.mock.calls[0][0];
      const requestBody = JSON.parse(commandArg.body);
      
      expect(requestBody).toHaveProperty('prompt', prompt);
      expect(requestBody).toHaveProperty('max_tokens', 4000);
      expect(requestBody).toHaveProperty('temperature', 0.7);
      expect(requestBody).toHaveProperty('return_likelihoods', 'NONE');
      expect(requestBody).toHaveProperty('system');
    });
    
    it('should throw error for unsupported model', async () => {
      // 未対応のモデルを使用するようにプロバイダーを設定
      provider = new AWSBedrockProvider(
        'test-access-key',
        'test-secret-key',
        'us-east-1',
        'unsupported-model',
        0.7,
        4000
      );
      
      await expect(provider.generateCode('test prompt')).rejects.toThrow(AppError);
      await expect(provider.generateCode('test prompt')).rejects.toThrow('AIコード生成中にエラーが発生しました');
    });
    
    it('should include language and framework in system prompt', async () => {
      const prompt = 'カウンターコンポーネントを作成してください';
      const options = {
        language: 'typescript',
        framework: 'react',
      };
      
      await provider.generateCode(prompt, options);
      
      const commandArg = mockInvokeModelCommand.mock.calls[0][0];
      const requestBody = JSON.parse(commandArg.body);
      const systemPrompt = requestBody.messages[0].content;
      
      expect(systemPrompt).toContain('使用言語: typescript');
      expect(systemPrompt).toContain('使用フレームワーク: react');
    });
    
    it('should handle API errors', async () => {
      mockSend.mockRejectedValue(new Error('API error'));
      
      await expect(provider.generateCode('test prompt')).rejects.toThrow(AppError);
      await expect(provider.generateCode('test prompt')).rejects.toThrow('AIコード生成中にエラーが発生しました');
    });

    it('should handle empty response body', async () => {
      mockSend.mockResolvedValue({});
      
      await expect(provider.generateCode('test prompt')).rejects.toThrow(AppError);
      await expect(provider.generateCode('test prompt')).rejects.toThrow('AIコード生成中にエラーが発生しました');
    });
  });
  
  describe('improveCode', () => {
    it('should call AWS Bedrock API with code and instructions', async () => {
      const code = 'function add(a, b) { return a + b; }';
      const instructions = 'TypeScriptに変換してください';
      
      const result = await provider.improveCode(code, instructions);
      
      expect(mockInvokeModelCommand).toHaveBeenCalledTimes(1);
      const commandArg = mockInvokeModelCommand.mock.calls[0][0];
      const requestBody = JSON.parse(commandArg.body);
      const userPrompt = requestBody.messages[1].content;
      
      expect(userPrompt).toContain(code);
      expect(userPrompt).toContain(instructions);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('explainCode', () => {
    it('should call AWS Bedrock API with code to explain', async () => {
      const code = 'function add(a, b) { return a + b; }';
      
      const result = await provider.explainCode(code);
      
      expect(mockInvokeModelCommand).toHaveBeenCalledTimes(1);
      const commandArg = mockInvokeModelCommand.mock.calls[0][0];
      const requestBody = JSON.parse(commandArg.body);
      const userPrompt = requestBody.messages[1].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('generateTests', () => {
    it('should call AWS Bedrock API with code to test', async () => {
      const code = 'function add(a, b) { return a + b; }';
      
      const result = await provider.generateTests(code);
      
      expect(mockInvokeModelCommand).toHaveBeenCalledTimes(1);
      const commandArg = mockInvokeModelCommand.mock.calls[0][0];
      const requestBody = JSON.parse(commandArg.body);
      const userPrompt = requestBody.messages[1].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('additionalContext', () => {
    it('should include additional context in system prompt', async () => {
      const prompt = 'テストプロンプト';
      const options = {
        additionalContext: {
          projectType: 'ウェブアプリケーション',
          targetAudience: '一般ユーザー',
        },
      };
      
      await provider.generateCode(prompt, options);
      
      const commandArg = mockInvokeModelCommand.mock.calls[0][0];
      const requestBody = JSON.parse(commandArg.body);
      const systemPrompt = requestBody.messages[0].content;
      
      expect(systemPrompt).toContain('追加コンテキスト:');
      expect(systemPrompt).toContain('projectType: ウェブアプリケーション');
      expect(systemPrompt).toContain('targetAudience: 一般ユーザー');
    });
  });

  describe('custom options', () => {
    it('should use custom model, temperature and max tokens', async () => {
      const prompt = 'テストプロンプト';
      const options = {
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        temperature: 0.3,
        maxTokens: 2000,
      };
      
      await provider.generateCode(prompt, options);
      
      const commandArg = mockInvokeModelCommand.mock.calls[0][0];
      expect(commandArg.modelId).toBe('anthropic.claude-3-haiku-20240307-v1:0');
      
      const requestBody = JSON.parse(commandArg.body);
      expect(requestBody.temperature).toBe(0.3);
      expect(requestBody.max_tokens).toBe(2000);
    });
  });

  // 残りのメソッドのテストも同様に実装
  // 簡潔にするため、他のメソッドのテストは省略
});