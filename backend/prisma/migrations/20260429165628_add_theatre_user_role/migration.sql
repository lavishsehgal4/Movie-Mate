-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TheatreRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "TheatreUser" (
    "user_id" INTEGER NOT NULL,
    "theatre_id" INTEGER NOT NULL,
    "role" "TheatreRole" NOT NULL,

    CONSTRAINT "TheatreUser_pkey" PRIMARY KEY ("user_id","theatre_id")
);

-- CreateIndex
CREATE INDEX "TheatreUser_user_id_idx" ON "TheatreUser"("user_id");

-- AddForeignKey
ALTER TABLE "TheatreUser" ADD CONSTRAINT "TheatreUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheatreUser" ADD CONSTRAINT "TheatreUser_theatre_id_fkey" FOREIGN KEY ("theatre_id") REFERENCES "Theatre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
