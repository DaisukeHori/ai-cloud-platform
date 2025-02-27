import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIModel, AIRequestOptions } from './ai-provider.interface';
import { AppError } from '../../middlewares/error.middleware';

/**
 * Anthropic Claude APIプロバイダー
 */
export class AnthropicProvider implements AIProvider {
  readonly name = 'Anthropic Claude';
  readonly id = 'anthropic';

  private client: Anthropic;
  private defaultModelId: string;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  /**
   * 利用可能なモデル一覧
   */
  readonly availableModels: AIModel[] = [
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      description: 'Anthropicの最も高性能なモデル。複雑な推論と創造的なタスクに最適。',
      contextWindow: 200000,
      maxOutputTokens: 4096,
      pricing: {
        inputPerToken: 0.00001,
        outputPerToken: 0.00003,
      },
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      description: '高性能と効率のバランスが取れたモデル。多くのタスクに適している。',
      contextWindow: 200000,
      maxOutputTokens: 4096,
      pricing: {
        inputPerToken: 0.000003,
        outputPerToken: 0.000015,
      },
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      description: '最も高速で経済的なモデル。シンプルなタスクに最適。',
      contextWindow: 200000,
      maxOutputTokens: 4096,
      pricing: {
        inputPerToken: 0.000001,
        outputPerToken: 0.000005,
      },
    },
  ];

  /**
   * コンストラクタ
   * @param apiKey Anthropic APIキー
   * @param defaultModelId デフォルトモデルID
   * @param defaultTemperature デフォルト温度
   * @param defaultMaxTokens デフォルト最大トークン数
   */
  constructor(
    apiKey: string,
    defaultModelId: string = 'claude-3-sonnet',
    defaultTemperature: number = 0.7,
    defaultMaxTokens: number = 4000
  ) {
    this.client = new Anthropic({
      apiKey,
    });
    this.defaultModelId = defaultModelId;
    this.defaultTemperature = defaultTemperature;
    this.defaultMaxTokens = defaultMaxTokens;
  }

  /**
   * コード生成
   * @param prompt プロンプト
   * @param options オプション
   * @returns 生成されたコード
   */
  async generateCode(prompt: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたは優秀なソフトウェアエンジニアです。ユーザーの要求に基づいて、高品質なコードを生成してください。' +
      'コードは実用的で、エラーがなく、最新のベストプラクティスに従ったものにしてください。' +
      'コードブロックは必ず ```言語名 で囲んでください。';

    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * コード改善
   * @param code 元のコード
   * @param instructions 改善指示
   * @param options オプション
   * @returns 改善されたコード
   */
  async improveCode(code: string, instructions: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたは優秀なソフトウェアエンジニアです。提供されたコードを指示に従って改善・リファクタリングしてください。' +
      'コードの品質、可読性、パフォーマンス、セキュリティを向上させることを目指してください。' +
      '改善されたコードを ```言語名 で囲んで提供してください。';

    const prompt = `以下のコードを改善してください:\n\n\`\`\`\n${code}\n\`\`\`\n\n改善指示:\n${instructions}`;
    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * コード説明
   * @param code 説明するコード
   * @param options オプション
   * @returns コードの説明
   */
  async explainCode(code: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたは優秀なソフトウェアエンジニアです。提供されたコードを詳細に説明してください。' +
      'コードの目的、機能、アルゴリズム、重要な部分を明確に説明してください。' +
      '初心者にもわかりやすく、かつ技術的な正確さを保った説明を提供してください。';

    const prompt = `以下のコードを説明してください:\n\n\`\`\`\n${code}\n\`\`\``;
    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * テスト生成
   * @param code テスト対象のコード
   * @param options オプション
   * @returns 生成されたテストコード
   */
  async generateTests(code: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたは優秀なソフトウェアエンジニアです。提供されたコードに対する包括的なテストを生成してください。' +
      'ユニットテスト、エッジケース、例外処理のテストを含めてください。' +
      '適切なテストフレームワーク（Jest、Pytest、JUnitなど）を使用してください。' +
      'テストコードを ```言語名 で囲んで提供してください。';

    const prompt = `以下のコードに対するテストを生成してください:\n\n\`\`\`\n${code}\n\`\`\``;
    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * ドキュメント生成
   * @param code ドキュメント対象のコード
   * @param options オプション
   * @returns 生成されたドキュメント
   */
  async generateDocumentation(code: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたは優秀なソフトウェアエンジニアです。提供されたコードに対する包括的なドキュメントを生成してください。' +
      '関数、クラス、メソッドの説明、パラメータ、戻り値、例外、使用例を含めてください。' +
      'マークダウン形式で整形されたドキュメントを提供してください。';

    const prompt = `以下のコードに対するドキュメントを生成してください:\n\n\`\`\`\n${code}\n\`\`\``;
    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * アーキテクチャ提案
   * @param requirements 要件
   * @param options オプション
   * @returns アーキテクチャ提案
   */
  async suggestArchitecture(requirements: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたは経験豊富なソフトウェアアーキテクトです。提供された要件に基づいて、最適なアーキテクチャを提案してください。' +
      'コンポーネント、サービス、データフロー、技術スタック、デプロイ戦略を含めてください。' +
      'アーキテクチャ図（テキストベース）も可能であれば含めてください。';

    const prompt = `以下の要件に基づいて、最適なアーキテクチャを提案してください:\n\n${requirements}`;
    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * バグ修正提案
   * @param code バグのあるコード
   * @param errorMessage エラーメッセージ
   * @param options オプション
   * @returns 修正提案
   */
  async suggestBugFix(code: string, errorMessage: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたは優秀なデバッガーです。提供されたコードとエラーメッセージに基づいて、バグの原因と修正方法を提案してください。' +
      '問題の根本原因を特定し、修正されたコードを提供してください。' +
      '修正されたコードを ```言語名 で囲んで提供してください。';

    const prompt = `以下のコードにバグがあります:\n\n\`\`\`\n${code}\n\`\`\`\n\nエラーメッセージ:\n${errorMessage}\n\nバグの原因と修正方法を提案してください。`;
    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * パフォーマンス最適化提案
   * @param code 最適化対象のコード
   * @param options オプション
   * @returns 最適化提案
   */
  async suggestOptimization(code: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたはパフォーマンス最適化の専門家です。提供されたコードのパフォーマンスを向上させる方法を提案してください。' +
      '時間複雑度、空間複雑度、アルゴリズムの選択、データ構造、メモリ使用量、非同期処理などの観点から分析してください。' +
      '最適化されたコードを ```言語名 で囲んで提供してください。';

    const prompt = `以下のコードのパフォーマンスを最適化する方法を提案してください:\n\n\`\`\`\n${code}\n\`\`\``;
    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * セキュリティ脆弱性チェック
   * @param code チェック対象のコード
   * @param options オプション
   * @returns 脆弱性レポート
   */
  async checkSecurity(code: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたはセキュリティ専門家です。提供されたコードのセキュリティ脆弱性を特定し、修正方法を提案してください。' +
      'OWASP Top 10、インジェクション攻撃、認証問題、暗号化の問題、データ検証などの観点から分析してください。' +
      '脆弱性の重大度と修正されたコードを提供してください。';

    const prompt = `以下のコードのセキュリティ脆弱性を特定し、修正方法を提案してください:\n\n\`\`\`\n${code}\n\`\`\``;
    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * API設計提案
   * @param requirements API要件
   * @param options オプション
   * @returns API設計提案
   */
  async designAPI(requirements: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたはAPI設計の専門家です。提供された要件に基づいて、RESTful APIまたはGraphQL APIの設計を提案してください。' +
      'エンドポイント、リクエスト/レスポンス形式、認証方法、エラーハンドリング、ページネーション、レート制限などを含めてください。' +
      'OpenAPI/Swagger形式またはGraphQLスキーマ形式で提供してください。';

    const prompt = `以下の要件に基づいて、API設計を提案してください:\n\n${requirements}`;
    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * データモデル設計提案
   * @param requirements データモデル要件
   * @param options オプション
   * @returns データモデル設計提案
   */
  async designDataModel(requirements: string, options?: AIRequestOptions): Promise<string> {
    const systemPrompt = options?.systemPrompt || 
      'あなたはデータモデリングの専門家です。提供された要件に基づいて、データベースモデルを設計してください。' +
      'エンティティ、属性、リレーションシップ、インデックス、制約などを含めてください。' +
      'ERダイアグラム（テキストベース）とSQLスキーマまたはORMモデル定義を提供してください。';

    const prompt = `以下の要件に基づいて、データモデルを設計してください:\n\n${requirements}`;
    return this.callAPI(prompt, systemPrompt, options);
  }

  /**
   * Anthropic Claude APIを呼び出す共通メソッド
   * @param prompt ユーザープロンプト
   * @param systemPrompt システムプロンプト
   * @param options オプション
   * @returns APIレスポンス
   */
  private async callAPI(prompt: string, systemPrompt: string, options?: AIRequestOptions): Promise<string> {
    try {
      // オプションの設定
      const modelId = options?.modelId || this.defaultModelId;
      const temperature = options?.temperature ?? this.defaultTemperature;
      const maxTokens = options?.maxTokens ?? this.defaultMaxTokens;

      // 言語とフレームワークの情報を追加
      let enhancedSystemPrompt = systemPrompt;
      if (options?.language) {
        enhancedSystemPrompt += `\n使用言語: ${options.language}`;
      }
      if (options?.framework) {
        enhancedSystemPrompt += `\n使用フレームワーク: ${options.framework}`;
      }

      // 追加コンテキストの追加
      if (options?.additionalContext) {
        enhancedSystemPrompt += '\n\n追加コンテキスト:';
        for (const [key, value] of Object.entries(options.additionalContext)) {
          enhancedSystemPrompt += `\n${key}: ${value}`;
        }
      }

      // APIリクエスト
      const response = await this.client.messages.create({
        model: modelId,
        system: enhancedSystemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
      });

      // レスポンスの取得
      // content[0]がテキストコンテンツを持つオブジェクトかどうかを確認
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if (typeof firstContent === 'object' && 'type' in firstContent && firstContent.type === 'text') {
          return firstContent.text || '';
        }
      }
      
      // フォールバック: 何らかの方法でテキストを抽出
      return response.content?.[0]?.toString() || '';
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new AppError('AIコード生成中にエラーが発生しました', 500);
    }
  }
}