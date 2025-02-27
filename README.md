# AIクラウド開発プラットフォーム

![バージョン](https://img.shields.io/badge/version-0.1.0-blue.svg)
![ライセンス](https://img.shields.io/badge/license-MIT-green.svg)

AIを活用したクラウド開発プラットフォームです。AIによるコード生成、改善、説明、テスト生成などの機能を提供し、開発者の生産性を向上させます。

## 📋 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [システムアーキテクチャ](#システムアーキテクチャ)
- [技術スタック](#技術スタック)
- [ディレクトリ構造](#ディレクトリ構造)
- [前提条件](#前提条件)
- [インストール手順](#インストール手順)
  - [Docker環境](#docker環境)
  - [ローカル開発環境](#ローカル開発環境)
- [環境変数の設定](#環境変数の設定)
- [使用方法](#使用方法)
- [API仕様](#api仕様)
- [テスト](#テスト)
- [デプロイ](#デプロイ)
- [トラブルシューティング](#トラブルシューティング)
- [貢献ガイドライン](#貢献ガイドライン)
- [ライセンス](#ライセンス)
- [連絡先](#連絡先)

## 📝 概要

AIクラウド開発プラットフォームは、AIを活用して開発者の生産性を向上させるためのツールです。コードの生成、改善、説明、テスト生成などの機能を提供し、開発プロセスを効率化します。また、リアルタイムコラボレーション機能やデプロイメント機能も備えており、チーム開発をサポートします。

## ✨ 主な機能

### AIコード支援機能
- **コード生成**: 要件に基づいて、AIがコードを生成
- **コード改善**: 既存のコードを最適化、リファクタリング
- **コード説明**: 複雑なコードの動作を自然言語で説明
- **テスト生成**: ユニットテスト、統合テストの自動生成
- **ドキュメント生成**: コードからドキュメントを自動生成
- **バグ修正提案**: エラーメッセージに基づいた修正案の提示
- **セキュリティチェック**: コードのセキュリティ脆弱性を検出

### プロジェクト管理機能
- **プロジェクト作成・管理**: 複数プロジェクトの管理
- **ファイル管理**: プロジェクト内のファイル操作
- **バージョン管理**: 変更履歴の追跡
- **チャット履歴**: AIとのやり取りの保存と検索

### コラボレーション機能
- **リアルタイム編集**: 複数ユーザーによる同時編集
- **コメント・レビュー**: コードレビュー機能
- **権限管理**: ユーザーごとの権限設定

### デプロイメント機能
- **自動デプロイ**: クラウドへの自動デプロイ
- **デプロイ履歴**: デプロイの履歴管理
- **ロールバック**: 以前のバージョンへの復元

## 🏗 システムアーキテクチャ

システムは以下の主要コンポーネントで構成されています：

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│   フロントエンド   │◄────►│    バックエンド    │◄────►│   データベース    │
│    (React)      │      │   (Node.js)     │      │  (PostgreSQL)   │
│                 │      │                 │      │                 │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │                 │
                         │    AI サービス    │
                         │   (OpenAI等)     │
                         │                 │
                         └─────────────────┘
```

- **フロントエンド**: ユーザーインターフェースを提供し、バックエンドと通信
- **バックエンド**: ビジネスロジックを処理し、データベースとAIサービスと通信
- **データベース**: ユーザー情報、プロジェクト情報、ファイル情報などを保存
- **AIサービス**: OpenAI APIなどの外部AIサービスと連携

## 🛠 技術スタック

### バックエンド
- **言語**: TypeScript
- **フレームワーク**: Node.js, Express
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **認証**: JWT
- **リアルタイム通信**: Socket.IO
- **テスト**: Jest

### フロントエンド
- **言語**: TypeScript
- **フレームワーク**: React
- **状態管理**: React Query
- **UIライブラリ**: Chakra UI
- **ルーティング**: React Router
- **エディタ**: Monaco Editor
- **テスト**: Jest, React Testing Library

### インフラ
- **コンテナ化**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **デプロイ**: AWS, Heroku, Vercel など

## 📁 ディレクトリ構造

```
ai-cloud-platform/
├── .env                    # 環境変数
├── .gitignore              # Gitの除外ファイル設定
├── README.md               # プロジェクト説明
├── docker-compose.yml      # Docker Compose設定
├── backend/                # バックエンドコード
│   ├── Dockerfile          # バックエンド用Dockerfile
│   ├── package.json        # 依存関係
│   ├── tsconfig.json       # TypeScript設定
│   ├── .env                # バックエンド環境変数
│   ├── prisma/             # Prisma ORM
│   │   └── schema.prisma   # データベーススキーマ
│   ├── src/                # ソースコード
│   │   ├── index.ts        # エントリーポイント
│   │   ├── controllers/    # コントローラー
│   │   ├── middlewares/    # ミドルウェア
│   │   ├── routes/         # ルート定義
│   │   ├── services/       # サービス
│   │   └── utils/          # ユーティリティ
│   └── tests/              # テストコード
└── frontend/               # フロントエンドコード
    ├── Dockerfile          # フロントエンド用Dockerfile
    ├── nginx.conf          # Nginx設定
    ├── package.json        # 依存関係
    ├── tsconfig.json       # TypeScript設定
    ├── index.html          # HTMLエントリーポイント
    └── src/                # ソースコード
        ├── main.tsx        # エントリーポイント
        ├── App.tsx         # ルートコンポーネント
        ├── components/     # コンポーネント
        ├── contexts/       # Reactコンテキスト
        └── pages/          # ページコンポーネント
```

## 📋 前提条件

- Docker と Docker Compose (Docker環境の場合)
- Node.js v18以上 (ローカル開発環境の場合)
- npm v9以上 (ローカル開発環境の場合)
- PostgreSQL (ローカル開発環境の場合)
- OpenAI API キー
- GitHub アカウント (GitHub連携機能を使用する場合)

## 🚀 インストール手順

### Docker環境

1. リポジトリをクローン
```bash
git clone https://github.com/daisukehori/ai-cloud-platform.git
cd ai-cloud-platform
```

2. 環境変数の設定
```bash
# .envファイルをコピー
cp .env.example .env

# .envファイルを編集して必要なAPIキーを設定
nano .env
```

3. Dockerコンテナの起動
```bash
# イメージのビルドと起動
docker-compose up -d

# ログの確認
docker-compose logs -f
```

4. マイグレーションの実行（初回のみ）
```bash
# バックエンドコンテナ内でマイグレーションを実行
docker-compose exec backend npx prisma migrate deploy
```

5. アクセス
- フロントエンド: http://localhost
- バックエンドAPI: http://localhost/api
- WebSocket: http://localhost/socket.io

### ローカル開発環境

#### バックエンド

1. バックエンドディレクトリに移動
```bash
cd backend
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
```bash
# .envファイルをコピー
cp .env.example .env

# .envファイルを編集
nano .env
```

4. データベースのセットアップ
```bash
# マイグレーションの実行
npx prisma migrate dev

# Prismaクライアントの生成
npx prisma generate
```

5. 開発サーバーの起動
```bash
npm run dev
```

#### フロントエンド

1. フロントエンドディレクトリに移動
```bash
cd frontend
```

2. 依存関係のインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

4. アクセス
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:4000/api

## ⚙️ 環境変数の設定

### ルートディレクトリの.env

```
# OpenAI API設定
OPENAI_API_KEY=your_openai_api_key_here

# GitHub API設定
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### バックエンドの.env

```
# サーバー設定
PORT=4000
NODE_ENV=development

# データベース設定
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_cloud_dev?schema=public

# JWT設定
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# OpenAI API設定
OPENAI_API_KEY=your_openai_api_key_here

# GitHub API設定
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# デプロイ設定
DEPLOY_BASE_URL=http://localhost:4000
```

## 📖 使用方法

### ユーザー登録・ログイン

1. トップページにアクセス
2. 「登録」ボタンをクリックして新規ユーザー登録
3. メールアドレスとパスワードを入力して登録
4. 登録後、自動的にログイン

### プロジェクト作成

1. ダッシュボードの「新規プロジェクト」ボタンをクリック
2. プロジェクト名と説明を入力
3. 「作成」ボタンをクリック

### AIコード生成

1. プロジェクト内で「AIアシスタント」タブを選択
2. 要件を自然言語で入力（例：「ユーザー認証機能を実装するコードを生成して」）
3. 「送信」ボタンをクリック
4. 生成されたコードを確認し、必要に応じて編集
5. 「保存」ボタンをクリックしてプロジェクトに追加

### コラボレーション

1. プロジェクト設定から「共同作業者」タブを選択
2. 共同作業者のメールアドレスと権限を設定
3. 「招待」ボタンをクリック

### デプロイ

1. プロジェクト内で「デプロイ」タブを選択
2. デプロイ先を選択
3. 「デプロイ」ボタンをクリック
4. デプロイ状況を確認

## 📚 API仕様

### 認証API

#### ユーザー登録
- **エンドポイント**: `POST /api/auth/register`
- **リクエスト**:
  ```json
  {
    "name": "ユーザー名",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **レスポンス**:
  ```json
  {
    "id": "user-uuid",
    "name": "ユーザー名",
    "email": "user@example.com",
    "token": "jwt-token"
  }
  ```

#### ログイン
- **エンドポイント**: `POST /api/auth/login`
- **リクエスト**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **レスポンス**:
  ```json
  {
    "id": "user-uuid",
    "name": "ユーザー名",
    "email": "user@example.com",
    "token": "jwt-token"
  }
  ```

### プロジェクトAPI

#### プロジェクト一覧取得
- **エンドポイント**: `GET /api/projects`
- **ヘッダー**: `Authorization: Bearer jwt-token`
- **レスポンス**:
  ```json
  [
    {
      "id": "project-uuid",
      "name": "プロジェクト名",
      "description": "プロジェクト説明",
      "status": "active",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ]
  ```

#### プロジェクト作成
- **エンドポイント**: `POST /api/projects`
- **ヘッダー**: `Authorization: Bearer jwt-token`
- **リクエスト**:
  ```json
  {
    "name": "プロジェクト名",
    "description": "プロジェクト説明"
  }
  ```
- **レスポンス**:
  ```json
  {
    "id": "project-uuid",
    "name": "プロジェクト名",
    "description": "プロジェクト説明",
    "status": "active",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
  ```

### AIコード生成API

#### コード生成
- **エンドポイント**: `POST /api/ai/generate-code`
- **ヘッダー**: `Authorization: Bearer jwt-token`
- **リクエスト**:
  ```json
  {
    "prompt": "ユーザー認証機能を実装するコードを生成して",
    "language": "javascript",
    "framework": "express"
  }
  ```
- **レスポンス**:
  ```json
  {
    "code": "// 生成されたコード\nconst express = require('express');\n...",
    "explanation": "このコードはExpressを使用したユーザー認証機能を実装しています。..."
  }
  ```

## 🧪 テスト

### バックエンドのテスト

```bash
# バックエンドディレクトリに移動
cd backend

# 全てのテストを実行
npm test

# 特定のテストを実行
npm test -- -t "テスト名"

# カバレッジレポートの生成
npm test -- --coverage
```

### フロントエンドのテスト

```bash
# フロントエンドディレクトリに移動
cd frontend

# 全てのテストを実行
npm test

# 特定のテストを実行
npm test -- -t "テスト名"

# カバレッジレポートの生成
npm test -- --coverage
```

## 🚢 デプロイ

### Herokuへのデプロイ

1. Heroku CLIをインストール
```bash
npm install -g heroku
```

2. Herokuにログイン
```bash
heroku login
```

3. Herokuアプリを作成
```bash
heroku create ai-cloud-platform
```

4. PostgreSQLアドオンを追加
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

5. 環境変数を設定
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret_key_here
heroku config:set OPENAI_API_KEY=your_openai_api_key_here
# その他の環境変数も設定
```

6. デプロイ
```bash
git push heroku main
```

7. データベースマイグレーションを実行
```bash
heroku run npx prisma migrate deploy
```

### AWS EC2へのデプロイ

1. EC2インスタンスを起動
2. SSHでインスタンスに接続
3. Dockerをインストール
4. リポジトリをクローン
5. 環境変数を設定
6. Docker Composeでコンテナを起動

詳細な手順は[AWS EC2デプロイガイド](docs/aws-deployment.md)を参照してください。

## 🔧 トラブルシューティング

### よくある問題と解決策

#### Docker関連

**問題**: コンテナが起動しない
**解決策**:
```bash
# ログを確認
docker-compose logs

# コンテナを再起動
docker-compose down
docker-compose up -d
```

**問題**: データベース接続エラー
**解決策**:
```bash
# データベースコンテナが起動しているか確認
docker-compose ps

# データベース接続設定を確認
cat .env | grep DATABASE_URL
```

#### バックエンド関連

**問題**: APIエラー
**解決策**:
```bash
# ログを確認
docker-compose logs backend

# 環境変数が正しく設定されているか確認
docker-compose exec backend env | grep OPENAI_API_KEY
```

**問題**: マイグレーションエラー
**解決策**:
```bash
# マイグレーションをリセット
docker-compose exec backend npx prisma migrate reset --force
```

#### フロントエンド関連

**問題**: ビルドエラー
**解決策**:
```bash
# 依存関係を再インストール
docker-compose exec frontend npm install

# ビルドログを確認
docker-compose logs frontend
```

**問題**: APIへの接続エラー
**解決策**:
- フロントエンドの環境変数でAPIのURLが正しく設定されているか確認
- CORSの設定が正しいか確認

## 👥 貢献ガイドライン

このプロジェクトへの貢献を歓迎します。以下の手順で貢献できます：

1. リポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約

- TypeScriptの型を適切に使用する
- ESLintとPrettierのルールに従う
- テストを書く
- コミットメッセージは明確に

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 📞 連絡先

- 開発者: あなたの名前
- メール: your.email@example.com
- GitHub: [yourusername](https://github.com/yourusername)
- Twitter: [@yourusername](https://twitter.com/yourusername)

---

© 2025 AIクラウド開発プラットフォーム
