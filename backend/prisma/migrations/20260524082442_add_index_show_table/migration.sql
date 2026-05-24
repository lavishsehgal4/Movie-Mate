-- DropIndex
DROP INDEX "theatre_location_idx";

-- CreateIndex
CREATE INDEX "Show_movie_id_city_show_status_start_time_idx" ON "Show"("movie_id", "city", "show_status", "start_time");
