FROM node:18-alpine as build

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# ソースコードのコピー
COPY . .

# ビルド
RUN npm run build

# 本番環境用のイメージ
FROM nginx:alpine

# ビルドしたファイルをNginxのドキュメントルートにコピー
COPY --from=build /app/dist /usr/share/nginx/html

# Nginxの設定ファイルをコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ポート80を公開
EXPOSE 80

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]