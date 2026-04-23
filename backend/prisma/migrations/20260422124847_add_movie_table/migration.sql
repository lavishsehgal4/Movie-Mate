-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "overview" TEXT,
    "poster_path" TEXT NOT NULL,
    "backdrop_path" TEXT,
    "release_date" TIMESTAMP(3) NOT NULL,
    "runtime" INTEGER,
    "popularity" DOUBLE PRECISION NOT NULL,
    "adult" BOOLEAN NOT NULL,
    "certification" TEXT,
    "vote_average" DOUBLE PRECISION NOT NULL,
    "vote_count" INTEGER NOT NULL,
    "original_language" TEXT NOT NULL,
    "genres" JSONB,
    "cast" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdb_id_key" ON "Movie"("tmdb_id");
