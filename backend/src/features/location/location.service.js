const {
  validateAddStates,
  validateAddCities,
} = require("./location.validator");

const {
  addStates,
  addCities,
} = require("./location.repository");

// =========================
// ADD STATES
// =========================

async function createStates(data) {

  // validate
  const validation =
    validateAddStates(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // repo call
  const result = await addStates(
    data.normalizedStates
  );

  // response
  return {
    inserted_count: result.count,
  };
}

// =========================
// ADD CITIES
// =========================

async function createCities(data) {

  // validate
  const validation =
    validateAddCities(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // repo call
  const result = await addCities(
    data.normalizedCities
  );

  // response
  return {
    inserted_count: result.count,
  };
}

module.exports = {
  createStates,
  createCities,
};