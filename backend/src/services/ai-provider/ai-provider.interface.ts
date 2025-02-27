/**
 * AIプロバイダーインターフェース
 * 異なるAI APIプロバイダーの共通インターフェースを定義
 */
export interface AIProvider {
  /**
   * プロバイダー名
   */
  readonly name: string;

  /**
   * プロバイダーID
   */
  readonly id: string;

  /**
   * 利用可能なモデル一覧
   */
  readonly availableModels: AIModel[];

  /**
   * コード生成
   * @param prompt プロンプト
   * @param options オプション
   * @returns 生成されたコード
   */
  generateCode(prompt: string, options?: AIRequestOptions): Promise<string>;

  /**
   * コード改善
   * @param code 元のコード
   * @param instructions 改善指示
   * @param options オプション
   * @returns 改善されたコード
   */
  improveCode(code: string, instructions: string, options?: AIRequestOptions): Promise<string>;

  /**
   * コード説明
   * @param code 説明するコード
   * @param options オプション
   * @returns コードの説明
   */
  explainCode(code: string, options?: AIRequestOptions): Promise<string>;

  /**
   * テスト生成
   * @param code テスト対象のコード
   * @param options オプション
   * @returns 生成されたテストコード
   */
  generateTests(code: string, options?: AIRequestOptions): Promise<string>;

  /**
   * ドキュメント生成
   * @param code ドキュメント対象のコード
   * @param options オプション
   * @returns 生成されたドキュメント
   */
  generateDocumentation(code: string, options?: AIRequestOptions): Promise<string>;

  /**
   * アーキテクチャ提案
   * @param requirements 要件
   * @param options オプション
   * @returns アーキテクチャ提案
   */
  suggestArchitecture(requirements: string, options?: AIRequestOptions): Promise<string>;

  /**
   * バグ修正提案
   * @param code バグのあるコード
   * @param errorMessage エラーメッセージ
   * @param options オプション
   * @returns 修正提案
   */
  suggestBugFix(code: string, errorMessage: string, options?: AIRequestOptions): Promise<string>;

  /**
   * パフォーマンス最適化提案
   * @param code 最適化対象のコード
   * @param options オプション
   * @returns 最適化提案
   */
  suggestOptimization(code: string, options?: AIRequestOptions): Promise<string>;

  /**
   * セキュリティ脆弱性チェック
   * @param code チェック対象のコード
   * @param options オプション
   * @returns 脆弱性レポート
   */
  checkSecurity(code: string, options?: AIRequestOptions): Promise<string>;

  /**
   * API設計提案
   * @param requirements API要件
   * @param options オプション
   * @returns API設計提案
   */
  designAPI(requirements: string, options?: AIRequestOptions): Promise<string>;

  /**
   * データモデル設計提案
   * @param requirements データモデル要件
   * @param options オプション
   * @returns データモデル設計提案
   */
  designDataModel(requirements: string, options?: AIRequestOptions): Promise<string>;
}

/**
 * AIモデル情報
 */
export interface AIModel {
  /**
   * モデルID
   */
  id: string;

  /**
   * モデル名
   */
  name: string;

  /**
   * モデルの説明
   */
  description?: string;

  /**
   * モデルのコンテキストウィンドウサイズ（トークン数）
   */
  contextWindow: number;

  /**
   * モデルの最大出力トークン数
   */
  maxOutputTokens: number;

  /**
   * モデルの料金情報
   */
  pricing?: {
    /**
     * 入力トークンあたりの料金（USD）
     */
    inputPerToken: number;

    /**
     * 出力トークンあたりの料金（USD）
     */
    outputPerToken: number;
  };
}

/**
 * AIリクエストオプション
 */
export interface AIRequestOptions {
  /**
   * 使用するモデルID
   */
  modelId?: string;

  /**
   * 温度（0.0〜1.0）
   * 値が高いほど創造的な出力になる
   */
  temperature?: number;

  /**
   * 最大出力トークン数
   */
  maxTokens?: number;

  /**
   * システムプロンプト
   */
  systemPrompt?: string;

  /**
   * 追加コンテキスト
   */
  additionalContext?: Record<string, any>;

  /**
   * 言語
   */
  language?: string;

  /**
   * フレームワーク
   */
  framework?: string;
}

/**
 * AIプロバイダー設定
 */
export interface AIProviderConfig {
  /**
   * プロバイダーID
   */
  providerId: string;

  /**
   * APIキー
   */
  apiKey: string;

  /**
   * 組織ID
   */
  organizationId?: string;

  /**
   * エンドポイントURL
   */
  endpoint?: string;

  /**
   * デフォルトモデルID
   */
  defaultModelId?: string;

  /**
   * デフォルト温度
   */
  defaultTemperature?: number;

  /**
   * デフォルト最大トークン数
   */
  defaultMaxTokens?: number;
}

/**
 * AIプリセット
 */
export interface AIPreset {
  /**
   * プリセットID
   */
  id: string;

  /**
   * プリセット名
   */
  name: string;

  /**
   * プリセットの説明
   */
  description?: string;

  /**
   * プロバイダーID
   */
  providerId: string;

  /**
   * モデルID
   */
  modelId: string;

  /**
   * 温度
   */
  temperature: number;

  /**
   * 最大トークン数
   */
  maxTokens: number;

  /**
   * システムプロンプト
   */
  systemPrompt?: string;

  /**
   * 用途
   */
  purpose: 'code-generation' | 'code-improvement' | 'documentation' | 'testing' | 'architecture' | 'general';

  /**
   * 作成者ID
   */
  createdById: string;

  /**
   * 作成日時
   */
  createdAt: Date;

  /**
   * 更新日時
   */
  updatedAt: Date;

  /**
   * 共有設定
   */
  isShared: boolean;
}