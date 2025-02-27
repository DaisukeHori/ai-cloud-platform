# AIクラウド開発プラットフォーム

AIを活用したクラウド開発プラットフォームです。AIによるコード生成、改善、説明、テスト生成などの機能を提供します。

## 機能

- AIによるコード生成
- コードの改善と最適化
- コードの説明
- テストコードの生成
- ドキュメント生成
- プロジェクト管理
- リアルタイムコラボレーション
- デプロイメント

## 技術スタック

### バックエンド
- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Socket.IO
- JWT認証

### フロントエンド
- React
- TypeScript
- Chakra UI
- React Router
- React Query
- Monaco Editor

## 開発環境のセットアップ (Docker)

### 前提条件
- Docker
- Docker Compose

### 手順

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/ai-cloud-platform.git
cd ai-cloud-platform
```

2. 環境変数の設定
```bash
# .envファイルを編集して必要なAPIキーを設定
nano .env
```

3. Dockerコンテナの起動
```bash
docker-compose up -d
```

4. アクセス
- フロントエンド: http://localhost
- バックエンドAPI: http://localhost/api
- WebSocket: http://localhost/socket.io

## ローカル開発環境のセットアップ

### バックエンド

```bash
cd backend
npm install
npm run dev
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

## テスト

```bash
# バックエンドのテスト
cd backend
npm test

# フロントエンドのテスト
cd frontend
npm test
```

## ライセンス

MIT