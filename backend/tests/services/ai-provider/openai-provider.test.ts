import { OpenAIProvider } from '../../../src/services/ai-provider/openai-provider';
import { AppError } from '../../../src/middlewares/error.middleware';

// OpenAIのモックインスタンス
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

// OpenAIコンストラクタのモック
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => mockOpenAI),
  };
});

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  
  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
    
    // テスト用のプロバイダーインスタンスを作成
    provider = new OpenAIProvider(
      'test-api-key',
      'test-org-id',
      'gpt-4-turbo',
      0.7,
      4000
    );
    
    // モックレスポンスの設定
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'モックされたAI応答',
          },
        },
      ],
    });
  });
  
  describe('constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(provider.name).toBe('OpenAI');
      expect(provider.id).toBe('openai');
      expect(provider.availableModels.length).toBeGreaterThan(0);
    });
  });
  
  describe('generateCode', () => {
    it('should call OpenAI API with correct parameters', async () => {
      const prompt = 'Reactでカウンターコンポーネントを作成してください';
      const result = await provider.generateCode(prompt);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4-turbo',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
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
      
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const systemPrompt = callArgs.messages[0].content;
      
      expect(systemPrompt).toContain('使用言語: typescript');
      expect(systemPrompt).toContain('使用フレームワーク: react');
    });
    
    it('should handle API errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API error'));
      
      await expect(provider.generateCode('test prompt')).rejects.toThrow(AppError);
      await expect(provider.generateCode('test prompt')).rejects.toThrow('AIコード生成中にエラーが発生しました');
    });
  });
  
  describe('improveCode', () => {
    it('should call OpenAI API with code and instructions', async () => {
      const code = 'function add(a, b) { return a + b; }';
      const instructions = 'TypeScriptに変換してください';
      
      const result = await provider.improveCode(code, instructions);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[1].content;
      
      expect(userPrompt).toContain(code);
      expect(userPrompt).toContain(instructions);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('explainCode', () => {
    it('should call OpenAI API with code to explain', async () => {
      const code = 'function add(a, b) { return a + b; }';
      
      const result = await provider.explainCode(code);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[1].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('generateTests', () => {
    it('should call OpenAI API with code to test', async () => {
      const code = 'function add(a, b) { return a + b; }';
      
      const result = await provider.generateTests(code);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[1].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('generateDocumentation', () => {
    it('should call OpenAI API with code to document', async () => {
      const code = 'function add(a, b) { return a + b; }';
      
      const result = await provider.generateDocumentation(code);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[1].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('suggestArchitecture', () => {
    it('should call OpenAI API with requirements', async () => {
      const requirements = 'ECサイトを作成したい';
      
      const result = await provider.suggestArchitecture(requirements);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[1].content;
      
      expect(userPrompt).toContain(requirements);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('suggestBugFix', () => {
    it('should call OpenAI API with buggy code and error message', async () => {
      const code = 'function add(a, b) { return a - b; }';
      const errorMessage = 'Expected 3 but got -1';
      
      const result = await provider.suggestBugFix(code, errorMessage);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[1].content;
      
      expect(userPrompt).toContain(code);
      expect(userPrompt).toContain(errorMessage);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('suggestOptimization', () => {
    it('should call OpenAI API with code to optimize', async () => {
      const code = 'function fibonacci(n) { if (n <= 1) return n; return fibonacci(n-1) + fibonacci(n-2); }';
      
      const result = await provider.suggestOptimization(code);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[1].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('checkSecurity', () => {
    it('should call OpenAI API with code to check security', async () => {
      const code = 'app.get("/user", (req, res) => { const query = "SELECT * FROM users WHERE id = " + req.query.id; })';
      
      const result = await provider.checkSecurity(code);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[1].content;
      
      expect(userPrompt).toContain(code);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('designAPI', () => {
    it('should call OpenAI API with API requirements', async () => {
      const requirements = 'ユーザー管理APIを作成したい';
      
      const result = await provider.designAPI(requirements);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[1].content;
      
      expect(userPrompt).toContain(requirements);
      expect(result).toBe('モックされたAI応答');
    });
  });
  
  describe('designDataModel', () => {
    it('should call OpenAI API with data model requirements', async () => {
      const requirements = 'ECサイトのデータモデルを作成したい';
      
      const result = await provider.designDataModel(requirements);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const userPrompt = callArgs.messages[1].content;
      
      expect(userPrompt).toContain(requirements);
      expect(result).toBe('モックされたAI応答');
    });
  });
});