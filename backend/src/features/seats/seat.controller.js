const {
  addSeatsToScreen,
  fetchScreenSeatLayout,
  changeSeatStatus,
} = require("./seat.service");

// =========================
// CREATE SEATS
// =========================

async function httpCreateSeatsForScreen(req, res) {
  try {

    const result = await addSeatsToScreen(
      req.body
    );

    return res.status(201).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message: err.message || "Failed to create seats",
    });
  }
}

// =========================
// fetch SEATS
// =========================

async function httpGetScreenSeatLayout(req, res) {
  try {

    const result = await fetchScreenSeatLayout(
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
        err.message || "Failed to fetch seat layout",
    });
  }
}

// =========================
// update  SEATS status
// =========================


async function httpUpdateSeatStatus(req, res) {
  try {

    const result = await changeSeatStatus(
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
        err.message || "Failed to update seat status",
    });
  }
}

module.exports = {
  httpCreateSeatsForScreen,
  httpGetScreenSeatLayout,
  httpUpdateSeatStatus
};