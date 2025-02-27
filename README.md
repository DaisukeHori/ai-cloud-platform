# AIクラウド開発プラットフォーム

![バージョン](https://img.shields.io/badge/version-0.1.0-blue.svg)
![ライセンス](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node-v18+-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-v5.3-blue.svg)
![React](https://img.shields.io/badge/react-v18.2-61DAFB.svg)
![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg)

AIを活用したクラウド開発プラットフォームです。AIによるコード生成、改善、説明、テスト生成などの機能を提供し、開発者の生産性を向上させます。

## 📋 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [システムアーキテクチャ](#システムアーキテクチャ)
- [技術スタック](#技術スタック)
- [ディレクトリ構造](#ディレクトリ構造)
- [前提条件](#前提条件)
- [インストール手順](#インストール手順)
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

### プロジェクトの背景

近年、AIの進化により、コード生成や最適化などの作業を自動化できるようになりました。しかし、これらのAI機能を開発ワークフローに統合するためのプラットフォームはまだ少なく、多くの開発者は複数のツールを組み合わせて使用しています。

このプラットフォームは、AIコード支援機能、プロジェクト管理、コラボレーション、デプロイメントなどの機能を統合し、開発者が単一のプラットフォーム内で効率的に作業できるようにすることを目的としています。

### ビジョンと目標

**ビジョン**: AIの力を活用して、ソフトウェア開発の民主化を促進し、あらゆるスキルレベルの開発者がより速く、より良いコードを書けるようにする。

**目標**:
1. AIを活用したコード生成・改善機能により、開発速度を50%向上させる
2. コラボレーション機能により、チーム間のコミュニケーションを効率化する
3. 統合されたデプロイメント機能により、デプロイプロセスを簡素化する
4. 初心者開発者の学習曲線を緩やかにし、プログラミングの敷居を下げる
5. エンタープライズレベルのセキュリティと拡張性を提供する

## ✨ 主な機能

### AIコード支援機能

#### コード生成

AIを活用して、自然言語の説明からコードを生成します。

**詳細**:
- **自然言語からコード生成**: 「ユーザー認証機能を実装して」のような自然言語の指示からコードを生成
- **言語・フレームワーク指定**: 特定のプログラミング言語やフレームワークに最適化されたコードを生成
- **コンテキスト認識**: プロジェクトの既存コードを考慮した生成
- **複数の実装オプション**: 同じ要件に対して複数の実装案を提示

**使用例**:
```
入力: "ユーザーがメールアドレスとパスワードで登録できるフォームを作成して、React と Formik を使用"

出力:
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email('無効なメールアドレスです')
    .required('メールアドレスは必須です'),
  password: Yup.string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .required('パスワードは必須です'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'パスワードが一致しません')
    .required('パスワード確認は必須です'),
});

const RegisterForm = () => {
  const handleSubmit = (values, { setSubmitting }) => {
    // APIリクエストなどの処理をここに記述
    console.log(values);
    setTimeout(() => {
      setSubmitting(false);
    }, 500);
  };

  return (
    <div className="register-form">
      <h2>ユーザー登録</h2>
      <Formik
        initialValues={{ email: '', password: '', confirmPassword: '' }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <Field type="email" name="email" className="form-control" />
              <ErrorMessage name="email" component="div" className="error" />
            </div>

            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <Field type="password" name="password" className="form-control" />
              <ErrorMessage name="password" component="div" className="error" />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">パスワード確認</label>
              <Field type="password" name="confirmPassword" className="form-control" />
              <ErrorMessage name="confirmPassword" component="div" className="error" />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? '送信中...' : '登録'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegisterForm;
```

#### コードの改善と最適化

既存のコードを分析し、パフォーマンス、可読性、セキュリティなどの観点から改善案を提示します。

**詳細**:
- **パフォーマンス最適化**: 実行速度やメモリ使用量を改善
- **コード品質向上**: 可読性、保守性、拡張性の向上
- **ベストプラクティス適用**: 言語やフレームワークのベストプラクティスに準拠
- **リファクタリング提案**: コードの構造を改善する提案

**使用例**:
```
// 改善前のコード
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price * items[i].quantity;
    if (items[i].discounted) {
      total = total - (items[i].price * items[i].quantity * 0.1);
    }
  }
  return total;
}

// AIによる改善後のコード
function calculateTotal(items) {
  return items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    const discount = item.discounted ? itemTotal * 0.1 : 0;
    return total + itemTotal - discount;
  }, 0);
}
```

#### コードの説明

複雑なコードを自然言語で説明し、理解を助けます。

**詳細**:
- **行ごとの説明**: コードの各行や重要な部分の詳細な説明
- **アルゴリズム解説**: 使用されているアルゴリズムやデザインパターンの説明
- **ビジュアル表現**: フローチャートや図による視覚的な説明
- **関連ドキュメント参照**: 関連するライブラリやフレームワークのドキュメントへの参照

**使用例**:
```javascript
// 説明対象のコード
const memoizedFibonacci = (() => {
  const cache = {};
  return function fibonacci(n) {
    if (n in cache) return cache[n];
    if (n <= 1) return n;
    return cache[n] = fibonacci(n - 1) + fibonacci(n - 2);
  };
})();
```

**AIによる説明**:
```
このコードはフィボナッチ数列を計算する関数を、メモ化（計算結果のキャッシュ）を使って最適化しています。

1. まず、即時実行関数式（IIFE）を使用して、クロージャを作成しています。
   - `(() => { ... })()` の形式で、定義と同時に実行されます。

2. クロージャ内で `cache` オブジェクトを定義しています。
   - このオブジェクトは外部からアクセスできず、関数内でのみ使用されます。
   - 計算済みのフィボナッチ数を保存するためのキャッシュとして機能します。

3. 内部で `fibonacci` 関数を定義し、それを返しています。
   - この関数は引数 `n` を受け取り、n番目のフィボナッチ数を返します。

4. 関数内では、まず `n in cache` でキャッシュにすでに計算結果があるかチェックします。
   - あれば、その値をすぐに返します（計算の重複を避ける）。

5. `n <= 1` の場合は、フィボナッチ数列の定義により、そのまま `n` を返します。
   - F(0) = 0, F(1) = 1 という定義に基づいています。

6. それ以外の場合は、再帰的に `fibonacci(n - 1) + fibonacci(n - 2)` を計算し、
   その結果を `cache[n]` に保存してから返します。
   - `cache[n] = ...` という代入式の結果が関数の戻り値になります。

このメモ化アプローチにより、時間計算量は O(2^n) から O(n) に改善され、
大きな n に対しても効率的に計算できるようになります。
```

#### テストコードの生成

実装コードに対応するテストコードを自動生成します。

**詳細**:
- **ユニットテスト生成**: 関数やクラスのユニットテストを自動生成
- **テストケース網羅**: エッジケースを含む複数のテストケースを生成
- **モック・スタブ作成**: 依存関係のモックやスタブを自動生成
- **テストフレームワーク対応**: Jest, Mocha, JUnitなど様々なテストフレームワークに対応

**使用例**:
```javascript
// テスト対象の関数
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// AIが生成したテストコード
describe('validateEmail', () => {
  test('有効なメールアドレスを検証できる', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('name.surname@domain.co.jp')).toBe(true);
    expect(validateEmail('user-name@example.domain.com')).toBe(true);
  });

  test('無効なメールアドレスを検出できる', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('with spaces@domain.com')).toBe(false);
    expect(validateEmail('missing.domain@.com')).toBe(false);
  });

  test('エッジケースを適切に処理できる', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
    expect(validateEmail(123)).toBe(false);
  });
});
```

## 🏗 システムアーキテクチャ

### 全体アーキテクチャ

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

### コンポーネント間の連携

各コンポーネント間の連携は以下のように行われます：

1. **フロントエンド ⟷ バックエンド**:
   - RESTful APIを使用した通信
   - WebSocketを使用したリアルタイム通信
   - JWT認証による安全な通信

2. **バックエンド ⟷ データベース**:
   - Prisma ORMを使用したデータアクセス
   - トランザクション管理による整合性の確保
   - コネクションプールによる効率的な接続管理

3. **バックエンド ⟷ AIサービス**:
   - HTTPSを使用した安全な通信
   - APIキーによる認証
   - レート制限の管理
   - フォールバック機構による可用性の確保

## 🛠 技術スタック

### バックエンド技術

- **言語**: TypeScript 5.3
- **ランタイム**: Node.js 18+
- **フレームワーク**: Express 4.18
- **ORM**: Prisma 5.7
- **認証**: JWT (jsonwebtoken 9.0)
- **バリデーション**: express-validator 7.0
- **リアルタイム通信**: Socket.IO 4.7
- **ロギング**: Winston 3.11
- **ファイル操作**: Multer 1.4

### フロントエンド技術

- **言語**: TypeScript 5.3
- **フレームワーク**: React 18.2
- **状態管理**: React Query 5.17
- **UIライブラリ**: Chakra UI 2.8
- **ルーティング**: React Router 6.21
- **フォーム**: Formik + Yup
- **HTTPクライアント**: Axios 1.6
- **コードエディタ**: Monaco Editor 4.6
- **アニメーション**: Framer Motion 10.18

### データベース技術

- **RDBMS**: PostgreSQL 15
- **ORM**: Prisma
- **マイグレーション**: Prisma Migrate
- **シード**: Prisma Seed

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

### 必要なソフトウェア

- Docker と Docker Compose (Docker環境の場合)
- Node.js v18以上 (ローカル開発環境の場合)
- npm v9以上 (ローカル開発環境の場合)
- PostgreSQL (ローカル開発環境の場合)

### 必要なアカウント

- OpenAI API アカウント (APIキーが必要)
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

4. アクセス
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
ps ps
```
# データベース接続エラー
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

### 開発フロー

1. **イシューの作成**: 新機能や修正を実装する前に、まずイシューを作成して議論します。
2. **ブランチの命名規則**:
   - 機能追加: `feature/機能名`
   - バグ修正: `fix/バグ名`
   - リファクタリング: `refactor/対象名`
   - ドキュメント: `docs/対象名`
3. **コミットメッセージの規則**:
   - 追加: `feat: 機能の説明`
   - 修正: `fix: バグの説明`
   - リファクタリング: `refactor: 変更の説明`
   - ドキュメント: `docs: 変更の説明`
4. **レビュープロセス**: プルリクエストは少なくとも1人のレビュアーによる承認が必要です。
5. **CI/CDパイプライン**: プルリクエストはCI/CDパイプラインを通過する必要があります。

### コーディング規約

- **TypeScript**: [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)に従う
- **React**: [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)に従う
- **コメント**: 複雑なロジックには必ずコメントを追加
- **テスト**: 新機能には必ずテストを追加

### プルリクエスト手順

1. フォークしたリポジトリを最新の状態に更新
```bash
git remote add upstream https://github.com/original-owner/ai-cloud-platform.git
git fetch upstream
git checkout main
git merge upstream/main
```

2. 新しいブランチを作成
```bash
git checkout -b feature/your-feature-name
```

3. 変更を実装し、テストを追加

4. 変更をコミット
```bash
git add .
git commit -m "feat: Add your feature"
```

5. ブランチにプッシュ
```bash
git push origin feature/your-feature-name
```

6. GitHubでプルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

```
MIT License

Copyright (c) 2025 AIクラウド開発プラットフォーム

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 連絡先

- 開発者: あなたの名前
- メール: your.email@example.com
- GitHub: [yourusername](https://github.com/yourusername)
- Twitter: [@yourusername](https://twitter.com/yourusername)

---

© 2025 AIクラウド開発プラットフォーム
