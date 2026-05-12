-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state_id" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");

-- CreateIndex
CREATE INDEX "City_state_id_idx" ON "City"("state_id");

-- CreateIndex
CREATE UNIQUE INDEX "City_state_id_name_key" ON "City"("state_id", "name");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;
