/*
  Warnings:

  - You are about to drop the `Region` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `State` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubRegion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Region" DROP CONSTRAINT "Region_state_id_fkey";

-- DropForeignKey
ALTER TABLE "SubRegion" DROP CONSTRAINT "SubRegion_region_id_fkey";

-- DropIndex
DROP INDEX "Show_city_start_time_idx";

-- DropTable
DROP TABLE "Region";

-- DropTable
DROP TABLE "State";

-- DropTable
DROP TABLE "SubRegion";

-- CreateIndex
CREATE INDEX "Show_city_show_status_start_time_movie_id_idx" ON "Show"("city", "show_status", "start_time", "movie_id");


-- creatign postgis for geoindexing

CREATE EXTENSION IF NOT EXISTS postgis;
