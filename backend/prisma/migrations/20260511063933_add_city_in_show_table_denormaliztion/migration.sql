/*
  Warnings:

  - Added the required column `city` to the `Show` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "city" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Show_city_start_time_idx" ON "Show"("city", "start_time");
