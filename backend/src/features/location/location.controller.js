const {
  getAllLocationsService,
} = require("./location.service");

const getAllLocationsController = async (req, res, next) => {
  try {
    const data = await getAllLocationsService();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLocationsController,
};