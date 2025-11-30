-- CreateTable
CREATE TABLE "parts_of_speech" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parts_of_speech_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word_parts_of_speech" (
    "id" BIGSERIAL NOT NULL,
    "word_id" BIGINT NOT NULL,
    "pos_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "word_parts_of_speech_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parts_of_speech_code_key" ON "parts_of_speech"("code");

-- CreateIndex
CREATE INDEX "word_parts_of_speech_word_id_idx" ON "word_parts_of_speech"("word_id");

-- CreateIndex
CREATE INDEX "word_parts_of_speech_pos_id_idx" ON "word_parts_of_speech"("pos_id");

-- CreateIndex
CREATE UNIQUE INDEX "word_parts_of_speech_word_id_pos_id_key" ON "word_parts_of_speech"("word_id", "pos_id");

-- AddForeignKey
ALTER TABLE "word_parts_of_speech" ADD CONSTRAINT "word_parts_of_speech_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_parts_of_speech" ADD CONSTRAINT "word_parts_of_speech_pos_id_fkey" FOREIGN KEY ("pos_id") REFERENCES "parts_of_speech"("id") ON DELETE CASCADE ON UPDATE CASCADE;
