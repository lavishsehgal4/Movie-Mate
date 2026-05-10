const {
  addScreen,
  editScreen,
  fetchTheatreScreens,
} = require("./screen.service");

// =========================
// CREATE SCREEN
// =========================

async function httpCreateScreen(req, res) {
  try {

    const result = await addScreen(req.body);

    return res.status(201).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message: err.message || "Failed to create screen",
    });
  }
}

// =========================
// UPDATE SCREEN
// =========================

async function httpUpdateScreen(req, res) {
  try {

    const screenId = Number(req.params.screenId);

    const result = await editScreen(
      screenId,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message: err.message || "Failed to update screen",
    });
  }
}

// =========================
// GET THEATRE SCREENS
// =========================

async function httpGetTheatreScreens(req, res) {
  try {

    const result = await fetchTheatreScreens(
      req.query
    );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message: err.message || "Failed to fetch screens",
    });
  }
}

module.exports = {
  httpCreateScreen,
  httpUpdateScreen,
  httpGetTheatreScreens,
};