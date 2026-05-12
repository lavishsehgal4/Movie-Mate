const {
  createStates,
  createCities,
} = require("./location.service");

// =========================
// ADD STATES
// =========================

async function httpAddStates(req, res) {
  try {

    const result = await createStates(
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
        err.message || "Failed to add states",
    });
  }
}

// =========================
// ADD CITIES
// =========================

async function httpAddCities(req, res) {
  try {

    const result = await createCities(
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
        err.message || "Failed to add cities",
    });
  }
}

module.exports = {
  httpAddStates,
  httpAddCities,
};