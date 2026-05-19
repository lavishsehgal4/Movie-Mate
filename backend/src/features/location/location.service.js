const {
  getAllLocationsRepo,
} = require("./location.repository");

const getAllLocationsService = async () => {
  return await getAllLocationsRepo();
};

module.exports = {
  getAllLocationsService,
};