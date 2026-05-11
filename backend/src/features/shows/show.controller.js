const {
  addShows,
  fetchScreenShows,
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

module.exports = {
  httpCreateShows,
  httpGetScreenShows
};