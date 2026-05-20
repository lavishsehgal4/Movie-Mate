-- AlterTable
ALTER TABLE "Theatre" ADD COLUMN     "location" GEOGRAPHY(Point, 4326);

CREATE INDEX theatre_location_idx
ON "Theatre"
USING GIST(location);