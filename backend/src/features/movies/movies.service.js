const { validateGetMoviesQuery,validateGetMovieDetails } = require("./movies.validator");
const { getMovies,getMovieDetails } = require("./movies.repository");

async function fetchMovies(query) {
  // 🔹 1. validate
  const validation = validateGetMoviesQuery(query);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 🔹 2. call repo (query is already normalized by validator)
  const movies = await getMovies(query);

  // 🔹 3. return (no heavy transformation needed)
  return movies;
}

async function getMovieDetailsService(
  query
) {

  // =========================
  // 1. validate input
  // =========================

  const validation =
    validateGetMovieDetails(
      query
    );

  if (!validation.isValid) {
    throw new Error(
      validation.error
    );
  }

  // =========================
  // 2. fetch movie
  // =========================

  const movie =
    await getMovieDetails(
      query.movie_id
    );

  if (!movie) {
    throw new Error(
      "Movie not found"
    );
  }

  // =========================
  // 3. add image urls
  // =========================

  const movieWithImages = {
    ...movie,

    poster_path:
      movie.poster_path
        ? `${process.env.TMDB_IMAGE_BASE}${movie.poster_path}`
        : null,

    backdrop_path:
      movie.backdrop_path
        ? `${process.env.TMDB_IMAGE_BASE}${movie.backdrop_path}`
        : null,

    cast: Array.isArray(movie.cast)
      ? movie.cast.map((person) => ({
          ...person,

          profile_path:
            person.profile_path
              ? `${process.env.TMDB_IMAGE_BASE}${person.profile_path}`
              : null,
        }))
      : [],
  };

  // =========================
  // 4. return response
  // =========================

  return {
    movie: movieWithImages,
  };
}

module.exports = {
  fetchMovies,
  getMovieDetailsService,
};