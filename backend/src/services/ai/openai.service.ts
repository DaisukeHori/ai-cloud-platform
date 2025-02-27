import OpenAI from 'openai';
import { AppError } from '../../middlewares/error.middleware';

// OpenAI APIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AIコード生成サービス
 * OpenAI APIを使用してコード生成を行う
 */
export class OpenAIService {
  /**
   * コード生成
   * @param prompt ユーザーからのプロンプト
   * @param context プロジェクトのコンテキスト情報
   * @returns 生成されたコード
   */
  static async generateCode(prompt: string, context: ProjectContext): Promise<string> {
    try {
      // システムプロンプトの構築
      const systemPrompt = this.buildSystemPrompt(context);
      
      // OpenAI APIにリクエスト
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });
      
      // レスポンスからコードを抽出
      const generatedCode = response.choices[0]?.message?.content || '';
      return generatedCode;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new AppError('AIコード生成中にエラーが発生しました', 500);
    }
  }
  
  /**
   * コードの改善・リファクタリング
   * @param code 元のコード
   * @param instructions 改善指示
   * @returns 改善されたコード
   */
  static async improveCode(code: string, instructions: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'あなたは優秀なソフトウェアエンジニアです。提供されたコードを指示に従って改善・リファクタリングしてください。' 
          },
          { 
            role: 'user', 
            content: `以下のコードを改善してください:\n\n${code}\n\n改善指示:\n${instructions}` 
          }
        ],
        temperature: 0.5,
        max_tokens: 4000,
      });
      
      const improvedCode = response.choices[0]?.message?.content || '';
      return improvedCode;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new AppError('コード改善中にエラーが発生しました', 500);
    }
  }
  
  /**
   * コードの説明生成
   * @param code 説明するコード
   * @returns コードの説明
   */
  static async explainCode(code: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'あなたは優秀なソフトウェアエンジニアです。提供されたコードを詳細に説明してください。' 
          },
          { 
            role: 'user', 
            content: `以下のコードを説明してください:\n\n${code}` 
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });
      
      const explanation = response.choices[0]?.message?.content || '';
      return explanation;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new AppError('コード説明生成中にエラーが発生しました', 500);
    }
  }
  
  /**
   * システムプロンプトの構築
   * @param context プロジェクトのコンテキスト情報
   * @returns システムプロンプト
   */
  private static buildSystemPrompt(context: ProjectContext): string {
    const { projectName, projectDescription, files, language, framework } = context;
    
    // ファイル構造の文字列化
    const fileStructure = files
      .map(file => `- ${file.path}: ${file.type === 'file' ? '(ファイル)' : '(ディレクトリ)'}`)
      .join('\n');
    
    // 言語・フレームワークに関する情報
    const techStack = `言語: ${language || '指定なし'}\nフレームワーク: ${framework || '指定なし'}`;
    
    return `
あなたは優秀なソフトウェアエンジニアで、AIクラウド開発プラットフォームのコード生成アシスタントです。
ユーザーの要求に基づいて、高品質なコードを生成してください。

## プロジェクト情報
- プロジェクト名: ${projectName}
- 説明: ${projectDescription || 'なし'}

## 技術スタック
${techStack}

## ファイル構造
${fileStructure}

## 指示
1. ユーザーの要求を正確に理解し、適切なコードを生成してください
2. コードは実用的で、エラーがなく、最新のベストプラクティスに従ったものにしてください
3. 必要に応じてコメントを追加し、コードの理解を助けてください
4. コードブロックは必ず \`\`\` で囲んでください
5. 生成したコードの説明も簡潔に提供してください

それでは、ユーザーの要求に応えるコードを生成してください。
`;
  }
}

/**
 * プロジェクトのコンテキスト情報の型定義
 */
interface ProjectContext {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  files: {
    path: string;
    type: 'file' | 'directory';
    content?: string;
  }[];
  language?: string;
  framework?: string;
}