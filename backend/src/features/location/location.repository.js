const locationData = require("./location.json");

const getAllLocationsRepo = async () => {
  return locationData;
};

module.exports = {
  getAllLocationsRepo,
};