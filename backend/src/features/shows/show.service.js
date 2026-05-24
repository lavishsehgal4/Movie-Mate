const {
  validateCreateShows,
  validateGetScreenShows,
  validateGetMoviesByCities,
  validateGetNearbyMovies,
  validateGetMovieShowsByCities,
  validateGetNearbyMovieShows,
} = require("./show.validator");

const {
  getScreenShowsInRange,
  createShowsWithSeats,
  getScreenShowsByDate,
  getMoviesByCities,
  getNearbyMovies,
  getMovieShowsByCities,
  getNearbyMovieShows
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


async function getMovieShowsByCitiesService(
  data
) {

  // =========================
  // 1. validate input
  // =========================

  const validation =
    validateGetMovieShowsByCities(
      data
    );

  if (!validation.isValid) {
    throw new Error(
      validation.error
    );
  }

  // =========================
  // 2. fetch shows
  // =========================

  const shows =
    await getMovieShowsByCities(
      data.movie_id,
      data.cities
    );

  // =========================
  // 3. group by theatre
  // =========================

  const theatreMap =
    new Map();

  for (const show of shows) {

    const theatreId =
      show.theatre.id;

    // =========================
    // create theatre group
    // =========================

    if (
      !theatreMap.has(
        theatreId
      )
    ) {

      theatreMap.set(
        theatreId,
        {
          theatre: {
            ...show.theatre,

            chain_logo:
              show.theatre.chain_logo
                ? `${process.env.TMDB_IMAGE_BASE}${show.theatre.chain_logo}`
                : null,

            facilities:
              show.theatre.theatreFacilities.map(
                (item) => ({
                  id:
                    item.facility.id,

                  facility_name:
                    item.facility.facility_name,

                  facility_logo:
                    item.facility.facility_logo
                      ? `${process.env.TMDB_IMAGE_BASE}${item.facility.facility_logo}`
                      : null,
                })
              ),
          },

          shows: [],
        }
      );
    }

    // =========================
    // add show
    // =========================

    theatreMap
      .get(theatreId)
      .shows.push({
        id: show.id,

        screen_id:
          show.screen_id,

        start_time:
          show.start_time,

        end_time:
          show.end_time,

        language:
          show.language,

        format:
          show.format,

        base_price:
          show.base_price,
      });
  }

  // =========================
  // 4. return response
  // =========================

  return {
    theatres:
      Array.from(
        theatreMap.values()
      ),
  };
}


async function getNearbyMovieShowsService(
  data
) {

  // =========================
  // 1. validate input
  // =========================

  const validation =
    validateGetNearbyMovieShows(
      data
    );

  if (!validation.isValid) {
    throw new Error(
      validation.error
    );
  }

  // =========================
  // 2. fetch shows
  // =========================

  const shows =
    await getNearbyMovieShows(
      data.movie_id,
      data.latitude,
      data.longitude
    );

  // =========================
  // 3. group by theatre
  // =========================

  const theatreMap =
    new Map();

  for (const show of shows) {

    const theatreId =
      show.theatre.id;

    // =========================
    // create theatre group
    // =========================

    if (
      !theatreMap.has(
        theatreId
      )
    ) {

      theatreMap.set(
        theatreId,
        {
          theatre: {
            ...show.theatre,

            chain_logo:
              show.theatre.chain_logo
                ? `${process.env.TMDB_IMAGE_BASE}${show.theatre.chain_logo}`
                : null,

            facilities:
              show.theatre.theatreFacilities.map(
                (item) => ({
                  id:
                    item.facility.id,

                  facility_name:
                    item.facility.facility_name,

                  facility_logo:
                    item.facility.facility_logo
                      ? `${process.env.TMDB_IMAGE_BASE}${item.facility.facility_logo}`
                      : null,
                })
              ),
          },

          shows: [],
        }
      );
    }

    // =========================
    // add show
    // =========================

    theatreMap
      .get(theatreId)
      .shows.push({
        id: show.id,

        screen_id:
          show.screen_id,

        start_time:
          show.start_time,

        end_time:
          show.end_time,

        language:
          show.language,

        format:
          show.format,

        base_price:
          show.base_price,
      });
  }

  // =========================
  // 4. return response
  // =========================

  return {
    theatres:
      Array.from(
        theatreMap.values()
      ),
  };
}

module.exports = {
  addShows,
  fetchScreenShows,
  getCityMovies,
  getNearbyMoviesService,
  getMovieShowsByCitiesService,
  getNearbyMovieShowsService,
};