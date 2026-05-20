const {
  validateCreateShows,
  validateGetScreenShows,
  validateGetMoviesByCities,
  validateGetNearbyMovies,
} = require("./show.validator");

const {
  getScreenShowsInRange,
  createShowsWithSeats,
  getScreenShowsByDate,
  getMoviesByCities,
  getNearbyMovies,
} = require("./show.repository");

// =========================
// CREATE SHOWS
// =========================

async function addShows(data) {

  // =========================
  // 1. validate input
  // =========================

  const validation =
    validateCreateShows(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const shows = data.normalizedShows;

  // =========================
  // 2. calculate range
  // =========================

  const minStartTime = new Date(
    Math.min(
      ...shows.map((show) =>
        show.start_time.getTime()
      )
    )
  );

  const maxEndTime = new Date(
    Math.max(
      ...shows.map((show) =>
        show.end_time.getTime()
      )
    )
  );

  // =========================
  // 3. fetch existing shows
  // =========================

  const existingShows =
    await getScreenShowsInRange(
      data.screen_id,
      minStartTime,
      maxEndTime
    );

  // =========================
  // 4. overlap check
  // =========================

  for (const newShow of shows) {

    for (const existingShow of existingShows) {

      const isOverlap =
        existingShow.start_time <
          newShow.end_time &&
        existingShow.end_time >
          newShow.start_time;

      if (isOverlap) {
        throw new Error(
          "Show timing overlaps with existing show"
        );
      }
    }
  }

  // =========================
  // 5. create shows + show seats
  // =========================

  const createdShows =
    await createShowsWithSeats(
      shows,
      data.screen_id
    );

  // =========================
  // 6. return response
  // =========================

  return {
    shows: createdShows,
  };
}

// fetch shows on base of screen_id and date

async function fetchScreenShows(data) {

  // =========================
  // 1. validate
  // =========================

  const validation =
    validateGetScreenShows(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // =========================
  // 2. fetch shows
  // =========================

  const shows =
    await getScreenShowsByDate(
      data.screen_id,
      data.startOfDay,
      data.endOfDay
    );

  // =========================
  // 3. group unique movies
  // =========================

  const moviesMap = {};

  for (const show of shows) {

    const movie = show.movie;

    if (!moviesMap[movie.id]) {

      moviesMap[movie.id] = movie;
    }

    delete show.movie;
  }

  // =========================
  // 4. return response
  // =========================

  return {
    movies: moviesMap,

    shows,
  };
}

//fetch all movies of city

async function getCityMovies(data) {

  // =========================
  // 1. validate input
  // =========================

  const validation =
    validateGetMoviesByCities(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // =========================
  // 2. fetch movies
  // =========================

  
  const movies =
    await getMoviesByCities(
      data.cities
    );

  // =========================
  // 3. add tmdb base url
  // =========================

  const moviesWithImages =
    movies.map((movie) => ({
      ...movie,

      poster_path:
        movie.poster_path
          ? `${process.env.TMDB_IMAGE_BASE}${movie.poster_path}`
          : null,
    }));

  // =========================
  // 4. return response
  // =========================

  return {
    movies: moviesWithImages,
  };
}

async function getNearbyMoviesService(data) {

  // =========================
  // 1. validate input
  // =========================

  const validation =
    validateGetNearbyMovies(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // =========================
  // 2. fetch movies
  // =========================

  const movies =
    await getNearbyMovies(
      data.latitude,
      data.longitude,
      data.distance
    );

  // =========================
  // 3. add tmdb base url
  // =========================

  const moviesWithImages =
    movies.map((movie) => ({
      ...movie,

      poster_path:
        movie.poster_path
          ? `${process.env.TMDB_IMAGE_BASE}${movie.poster_path}`
          : null,
    }));

  // =========================
  // 4. return response
  // =========================

  return {
    movies: moviesWithImages,
  };
}

module.exports = {
  addShows,
  fetchScreenShows,
  getCityMovies,
  getNearbyMoviesService
};