/*
  Warnings:

  - You are about to drop the column `word_jp` on the `words` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "words" DROP COLUMN "word_jp";

-- CreateTable
CREATE TABLE "word_jps" (
    "id" BIGSERIAL NOT NULL,
    "word_id" BIGINT NOT NULL,
    "word_jp" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "word_jps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "word_jps_word_id_idx" ON "word_jps"("word_id");

-- CreateIndex
CREATE UNIQUE INDEX "word_jps_word_id_word_jp_key" ON "word_jps"("word_id", "word_jp");

-- AddForeignKey
ALTER TABLE "word_jps" ADD CONSTRAINT "word_jps_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
