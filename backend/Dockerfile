FROM node:18-alpine

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# Prismaのセットアップ
COPY prisma ./prisma/
RUN npx prisma generate

# ソースコードのコピー
COPY . .

# TypeScriptのビルド
RUN npm run build

# 実行コマンド
CMD ["npm", "start"]