const {
  addShows,
  fetchScreenShows,
  getCityMovies,
  getNearbyMoviesService,
  getMovieShowsByCitiesService,
  getNearbyMovieShowsService,
  getShowSeatLayoutService
} = require("./show.service");

// =========================
// CREATE SHOWS
// =========================

async function httpCreateShows(req, res) {
  try {
    
    const result = await addShows(
      req.body
    );

    return res.status(201).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message || "Failed to create shows",
    });
  }
}

async function httpGetScreenShows(req, res) {
  try {

    const result =
      await fetchScreenShows(
        req.query
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch screen shows",
    });
  }
}

async function httpGetCityMovies(req, res) {
  try {

    const result =
      await getCityMovies(
        req.body
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch movies",
    });
  }
}

async function httpGetNearbyMovies(
  req,
  res
) {
  try {

    const result =
      await getNearbyMoviesService(
        req.body
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch nearby movies",
    });
  }
}

async function httpGetMovieShowsByCities(
  req,
  res
) {
  try {

    const result =
      await getMovieShowsByCitiesService(
        req.body
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch movie shows",
    });
  }
}

async function httpGetNearbyMovieShows(
  req,
  res
) {
  try {

    const result =
      await getNearbyMovieShowsService(
        req.body
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch nearby movie shows",
    });
  }
}

async function httpGetShowSeatLayout(
  req,
  res
) {
  try {

    const result =
      await getShowSeatLayoutService(
        req.query
      );

       
    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch show seat layout",
    });
  }
}

module.exports = {
  httpCreateShows,
  httpGetScreenShows,
  httpGetCityMovies,
  httpGetNearbyMovies,
  httpGetMovieShowsByCities,
  httpGetNearbyMovieShows,
  httpGetShowSeatLayout
};