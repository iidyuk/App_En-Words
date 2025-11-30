# API / Prisma Setup

Local and container steps for the PostgreSQL database defined in `docs/DB設計 テーブル定義書 - *.csv`.

## 1. 環境変数
- `cp .env.example .env` で `DATABASE_URL` を用意（ローカル接続時は `localhost`、Docker 内からはホスト名 `db` を指定）。

## 2. データベース起動
- ルートで `docker compose up -d db` を実行。
- 状態確認: `docker compose ps` で `db` の `healthy` を確認。

## 3. マイグレーションとシード
```sh
cd api
npm install
# ローカルからDBへ: DATABASE_URL を localhost で上書き
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/enwords?schema=public" npm run prisma:migrate -- --name align_db_design
npm run prisma:migrate -- --name add_parts_of_speech  # 品詞テーブル追加分（最新スキーマ適用）
npm run prisma:migrate -- --name split_word_jp_table # word_jp を別テーブルに分離
npm run seed  # サンプルのユーザー・単語・ログを投入（幾度でも安全に実行可）
```
- Docker 起動時は `api/Dockerfile` 内で `prisma migrate deploy` が走るため、コンテナ単体でもDBが最新化される。

## 4. API 起動
- ローカル開発: `DATABASE_URL=... npm run dev`
- Docker: `docker compose up -d api`（`DATABASE_URL` は compose の `db` ホストを使用）

## 備考
- `word_group_id` は外部キー整合性のため `BIGINT` として定義しています。
- スキーマは `users`, `word_groups`, `words`, `user_word_checks`, `quiz_answer_logs` の5テーブルで、Prisma 定義は `prisma/schema.prisma` を参照してください。
