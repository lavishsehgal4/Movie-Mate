/*
  Warnings:

  - Made the column `search_title` on table `Movie` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Movie" ALTER COLUMN "search_title" SET NOT NULL;
