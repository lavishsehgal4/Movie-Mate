/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `State` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `State` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "State" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");
