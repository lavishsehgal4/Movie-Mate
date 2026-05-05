-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "search_title" TEXT;

-- CreateIndex
CREATE INDEX "Movie_popularity_idx" ON "Movie"("popularity");

-- CreateIndex
CREATE INDEX "Movie_release_date_idx" ON "Movie"("release_date");

-- CreateIndex
CREATE INDEX "Movie_contract_end_idx" ON "Movie"("contract_end");

-- CreateIndex
CREATE INDEX "Movie_original_language_idx" ON "Movie"("original_language");

-- CreateIndex
CREATE INDEX "Movie_title_idx" ON "Movie"("title");
