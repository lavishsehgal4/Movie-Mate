const { createTheatre } = require("./theatre.service");
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

module.exports = {
  httpCreateTheatre,
  httpGetMyTheatres,
};