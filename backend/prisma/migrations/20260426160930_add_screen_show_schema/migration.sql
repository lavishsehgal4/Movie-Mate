-- CreateEnum
CREATE TYPE "ShowStatus" AS ENUM ('scheduled', 'cancelled');

-- CreateTable
CREATE TABLE "Screen" (
    "id" SERIAL NOT NULL,
    "theatre_id" INTEGER NOT NULL,
    "screen_name" TEXT NOT NULL,

    CONSTRAINT "Screen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Show" (
    "id" SERIAL NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "screen_id" INTEGER NOT NULL,
    "theatre_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "language" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "show_status" "ShowStatus" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Screen_theatre_id_idx" ON "Screen"("theatre_id");

-- CreateIndex
CREATE INDEX "Show_movie_id_idx" ON "Show"("movie_id");

-- CreateIndex
CREATE INDEX "Show_screen_id_idx" ON "Show"("screen_id");

-- CreateIndex
CREATE INDEX "Show_theatre_id_idx" ON "Show"("theatre_id");

-- CreateIndex
CREATE INDEX "Show_start_time_movie_id_idx" ON "Show"("start_time", "movie_id");

-- CreateIndex
CREATE INDEX "Show_start_time_idx" ON "Show"("start_time");

-- AddForeignKey
ALTER TABLE "Screen" ADD CONSTRAINT "Screen_theatre_id_fkey" FOREIGN KEY ("theatre_id") REFERENCES "Theatre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "Screen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_theatre_id_fkey" FOREIGN KEY ("theatre_id") REFERENCES "Theatre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
