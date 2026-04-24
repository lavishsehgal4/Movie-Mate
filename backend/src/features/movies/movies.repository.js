const { prisma } = require("../../config/prisma");

async function upsertMovie(data) {
  return await prisma.movie.upsert({
    where: {
      tmdb_id: data.tmdb_id,
    },
    update: {
      title: data.title,
      original_title: data.original_title,
      overview: data.overview,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_date: data.release_date,
      runtime: data.runtime,
      popularity: data.popularity,
      adult: data.adult,
      certification: data.certification,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      original_language: data.original_language,
      genres: data.genres,
      cast: data.cast,
    },
    create: {
      tmdb_id: data.tmdb_id,
      title: data.title,
      original_title: data.original_title,
      overview: data.overview,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_date: data.release_date,
      runtime: data.runtime,
      popularity: data.popularity,
      adult: data.adult,
      certification: data.certification,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      original_language: data.original_language,
      genres: data.genres,
      cast: data.cast,
    },
  });
}

module.exports = {
  upsertMovie,
};