-- DropIndex
DROP INDEX "Show_start_time_movie_id_idx";

-- CreateIndex
CREATE INDEX "Show_screen_id_start_time_idx" ON "Show"("screen_id", "start_time");
