import { AnthropicProvider } from '../../../src/services/ai-provider/anthropic-provider';
import { AppError } from '../../../src/middlewares/error.middleware';

// Anthropicのモックインスタンス
const mockAnthropicMessages = {
  create: jest.fn(),
};

// Anthropicコンストラクタのモック
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true, default: jest.fn().mockImplementation(() => ({ messages: mockAnthropicMessages })),
  };
});

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider;
  
  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
    
    // テスト用のプロバイダーインスタンスを作成
    provider = new AnthropicProvider(
      'test-api-key',
      'claude-3-sonnet',
      0.7,
      4000
    );
    
    // モックレスポンスの設定 - テキストタイプのコンテンツ
    mockAnthropicMessages.create.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'モックされたAI応答',
        },
      ],
    });
  });
  
  describe('constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(provider.name).toBe('Anthropic Claude');
      expect(provider.id).toBe('anthropic');
      expect(provider.availableModels.length).toBeGreaterThan(0);
    });
  });
  
  describe('generateCode', () => {
    it('should call Anthropic API with correct parameters', async () => {
      const prompt = 'Reactでカウンターコンポーネントを作成してください';
      const result = await provider.generateCode(prompt);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      expect(mockAnthropicMessages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-sonnet',
          system: expect.stringContaining('ソフトウェアエンジニア'),
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: prompt }),
          ]),
          temperature: 0.7,
          max_tokens: 4000,
        })
      );
      
      expect(result).toBe('モックされたAI応答');
    });
    
    it('should include language and framework in system prompt', async () => {
      const prompt = 'カウンターコンポーネントを作成してください';
      const options = {
        language: 'typescript',
        framework: 'react',
      };
      
      await provider.generateCode(prompt, options);
      
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const systemPrompt = callArgs.system;
      
      expect(systemPrompt).toContain('使用言語: typescript');
      expect(systemPrompt).toContain('使用フレームワーク: react');
    });
    
    it('should handle API errors', async () => {
      mockAnthropicMessages.create.mockRejectedValue(new Error('API error'));
      
      await expect(provider.generateCode('test prompt')).rejects.toThrow(AppError);
      await expect(provider.generateCode('test prompt')).rejects.toThrow('AIコード生成中にエラーが発生しました');
    });

    it('should handle different response content formats', async () => {
      // テキスト以外のコンテンツタイプ
      mockAnthropicMessages.create.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            id: 'tool-123',
            name: 'some_tool',
          },
        ],
      });
      
      const result = await provider.generateCode('test prompt');
      expect(result).toBe('[object Object]'); // toString()の結果
      
      // 空のコンテンツ
      mockAnthropicMessages.create.mockResolvedValue({
        content: [],
      });
      
      const emptyResult = await provider.generateCode('test prompt');
      expect(emptyResult).toBe('');
      
      // コンテンツがない
      mockAnthropicMessages.create.mockResolvedValue({});
      
      const noContentResult = await provider.generateCode('test prompt');
      expect(noContentResult).toBe('');
    });
  });
  
  describe('improveCode', () => {
    it('should call Anthropic API with code and instructions', async () => {
      const code = 'function add(a, b) { return a + b; }';
      const instructions = 'TypeScriptに変換してください';
      
      const result = await provider.improveCode(code, instructions);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[0].content;
      
      expect(userPrompt).toContain(code);
      expect(userPrompt).toContain(instructions);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('explainCode', () => {
    it('should call Anthropic API with code to explain', async () => {
      const code = 'function add(a, b) { return a + b; }';
      
      const result = await provider.explainCode(code);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[0].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('generateTests', () => {
    it('should call Anthropic API with code to test', async () => {
      const code = 'function add(a, b) { return a + b; }';
      
      const result = await provider.generateTests(code);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[0].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('generateDocumentation', () => {
    it('should call Anthropic API with code to document', async () => {
      const code = 'function add(a, b) { return a + b; }';
      
      const result = await provider.generateDocumentation(code);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[0].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('suggestArchitecture', () => {
    it('should call Anthropic API with requirements', async () => {
      const requirements = 'ECサイトを作成したい';
      
      const result = await provider.suggestArchitecture(requirements);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[0].content;
      
      expect(userPrompt).toContain(requirements);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('suggestBugFix', () => {
    it('should call Anthropic API with buggy code and error message', async () => {
      const code = 'function add(a, b) { return a - b; }';
      const errorMessage = 'Expected 3 but got -1';
      
      const result = await provider.suggestBugFix(code, errorMessage);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[0].content;
      
      expect(userPrompt).toContain(code);
      expect(userPrompt).toContain(errorMessage);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('suggestOptimization', () => {
    it('should call Anthropic API with code to optimize', async () => {
      const code = 'function fibonacci(n) { if (n <= 1) return n; return fibonacci(n-1) + fibonacci(n-2); }';
      
      const result = await provider.suggestOptimization(code);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[0].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('checkSecurity', () => {
    it('should call Anthropic API with code to check security', async () => {
      const code = 'app.get("/user", (req, res) => { const query = "SELECT * FROM users WHERE id = " + req.query.id; })';
      
      const result = await provider.checkSecurity(code);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[0].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('designAPI', () => {
    it('should call Anthropic API with API requirements', async () => {
      const requirements = 'ユーザー管理APIを作成したい';
      
      const result = await provider.designAPI(requirements);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[0].content;
      
      expect(userPrompt).toContain(requirements);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('designDataModel', () => {
    it('should call Anthropic API with data model requirements', async () => {
      const requirements = 'ECサイトのデータモデルを作成したい';
      
      const result = await provider.designDataModel(requirements);
      
      expect(mockAnthropicMessages.create).toHaveBeenCalledTimes(1);
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[0].content;
      
      expect(userPrompt).toContain(requirements);
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
      
      const callArgs = mockAnthropicMessages.create.mock.calls[0][0];
      const systemPrompt = callArgs.system;
      
      expect(systemPrompt).toContain('追加コンテキスト:');
      expect(systemPrompt).toContain('projectType: ウェブアプリケーション');
      expect(systemPrompt).toContain('targetAudience: 一般ユーザー');
    });
  });
});