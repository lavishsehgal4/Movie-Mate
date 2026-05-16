/*
  Warnings:

  - You are about to drop the `City` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_state_id_fkey";

-- DropTable
DROP TABLE "City";

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "aliases" TEXT[],
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "allow_sales" BOOLEAN NOT NULL DEFAULT true,
    "geohash" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "honour_subregion_slug" BOOLEAN NOT NULL DEFAULT false,
    "state_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubRegion" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "allow_sales" BOOLEAN NOT NULL DEFAULT true,
    "geohash" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "region_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubRegion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE INDEX "Region_state_id_idx" ON "Region"("state_id");

-- CreateIndex
CREATE INDEX "Region_slug_idx" ON "Region"("slug");

-- CreateIndex
CREATE INDEX "Region_priority_idx" ON "Region"("priority");

-- CreateIndex
CREATE INDEX "Region_latitude_longitude_idx" ON "Region"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "Region_state_id_name_key" ON "Region"("state_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SubRegion_code_key" ON "SubRegion"("code");

-- CreateIndex
CREATE INDEX "SubRegion_region_id_idx" ON "SubRegion"("region_id");

-- CreateIndex
CREATE INDEX "SubRegion_slug_idx" ON "SubRegion"("slug");

-- CreateIndex
CREATE INDEX "SubRegion_priority_idx" ON "SubRegion"("priority");

-- CreateIndex
CREATE INDEX "SubRegion_latitude_longitude_idx" ON "SubRegion"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "SubRegion_region_id_name_key" ON "SubRegion"("region_id", "name");

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubRegion" ADD CONSTRAINT "SubRegion_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;
