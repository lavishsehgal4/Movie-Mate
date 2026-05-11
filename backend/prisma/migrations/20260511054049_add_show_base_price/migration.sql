/*
  Warnings:

  - Added the required column `base_price` to the `Show` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "base_price" DECIMAL(10,2) NOT NULL;
