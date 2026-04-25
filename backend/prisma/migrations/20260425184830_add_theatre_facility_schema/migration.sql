-- CreateTable
CREATE TABLE "Theatre" (
    "id" SERIAL NOT NULL,
    "theatre_name" TEXT NOT NULL,
    "chain_name" TEXT NOT NULL,
    "chain_logo" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "longitude" DECIMAL(9,6),
    "latitude" DECIMAL(9,6),
    "contact_no" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "total_screens" INTEGER,
    "is_active" BOOLEAN NOT NULL,
    "rating" DECIMAL(3,1),
    "google_map_url" TEXT,
    "opening_time" TIMESTAMP(3) NOT NULL,
    "closing_time" TIMESTAMP(3) NOT NULL,
    "pincode" INTEGER,
    "landmark" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Theatre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" SERIAL NOT NULL,
    "facility_name" TEXT NOT NULL,
    "facility_logo" TEXT,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TheatreFacility" (
    "theatre_id" INTEGER NOT NULL,
    "facility_id" INTEGER NOT NULL,

    CONSTRAINT "TheatreFacility_pkey" PRIMARY KEY ("theatre_id","facility_id")
);

-- CreateIndex
CREATE INDEX "Theatre_city_idx" ON "Theatre"("city");

-- CreateIndex
CREATE INDEX "Theatre_chain_name_city_idx" ON "Theatre"("chain_name", "city");

-- CreateIndex
CREATE INDEX "Theatre_longitude_latitude_idx" ON "Theatre"("longitude", "latitude");

-- CreateIndex
CREATE INDEX "Theatre_state_idx" ON "Theatre"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_facility_name_key" ON "Facility"("facility_name");

-- CreateIndex
CREATE INDEX "TheatreFacility_facility_id_idx" ON "TheatreFacility"("facility_id");

-- AddForeignKey
ALTER TABLE "TheatreFacility" ADD CONSTRAINT "TheatreFacility_theatre_id_fkey" FOREIGN KEY ("theatre_id") REFERENCES "Theatre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheatreFacility" ADD CONSTRAINT "TheatreFacility_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
