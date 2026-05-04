const { createTheatre,attachFacilitiesToTheatre  } = require("./theatre.service");
const { checkUserTheatreAccess } = require("./theatre.service");

const {getMyTheatres}=require('./theatre.service')
async function httpCreateTheatre(req, res) {
  try {
    // 🔹 1. get logged-in user
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🔹 2. call service
    const result = await createTheatre(req.body, userId);

    // 🔹 3. success response
    return res.status(201).json({
      success: true,
      data: result,
    });

  } catch (err) {
    // 🔹 4. error handling
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
}

async function httpGetMyTheatres(req, res) {
  try {
    // 🔹 1. get user from token (middleware)
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🔹 2. call service
    const theatres = await getMyTheatres(userId);

    // 🔹 3. success response
    return res.status(200).json({
      success: true,
      data: theatres,
    });

  } catch (err) {
    // 🔹 4. error handling
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
}

async function httpAttachFacilitiesToTheatre(req, res) {
  try {
    
    const result = await attachFacilitiesToTheatre(req.body);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to attach facilities",
    });
  }
}

async function httpCheckUserTheatreAccess(req, res) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await checkUserTheatreAccess(userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to check theatre access",
    });
  }
}

module.exports = {
  httpCreateTheatre,
  httpGetMyTheatres,
  httpAttachFacilitiesToTheatre,
  httpCheckUserTheatreAccess
};