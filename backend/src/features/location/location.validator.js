// =========================
// HELPERS
// =========================

function normalizeString(value) {

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

// =========================
// VALIDATE STATES
// =========================

function validateAddStates(data) {

  // states array
  if (
    !Array.isArray(data.states) ||
    data.states.length === 0
  ) {
    return {
      isValid: false,
      error: "states must be non-empty array",
    };
  }

  const normalizedStates = [];

  for (const state of data.states) {

    // name
    const name = normalizeString(
      state.name
    );

    if (!name) {
      return {
        isValid: false,
        error: "State name is required",
      };
    }

    // code
    const code = normalizeString(
      state.code
    ).toUpperCase();

    if (!code) {
      return {
        isValid: false,
        error: "State code is required",
      };
    }

    normalizedStates.push({
      name,
      code,
    });
  }

  // mutation
  data.normalizedStates =
    normalizedStates;

  return {
    isValid: true,
  };
}

// =========================
// VALIDATE CITIES
// =========================

function validateAddCities(data) {

  // cities array
  if (
    !Array.isArray(data.cities) ||
    data.cities.length === 0
  ) {
    return {
      isValid: false,
      error: "cities must be non-empty array",
    };
  }

  const normalizedCities = [];

  for (const city of data.cities) {

    // city name
    const name = normalizeString(
      city.name
    );

    if (!name) {
      return {
        isValid: false,
        error: "City name is required",
      };
    }

    // state code
    const stateCode = normalizeString(
      city.state_code
    ).toUpperCase();

    if (!stateCode) {
      return {
        isValid: false,
        error: "state_code is required",
      };
    }

    normalizedCities.push({
      name,

      state_code: stateCode,

      is_default:
        Boolean(city.is_default),
    });
  }

  // mutation
  data.normalizedCities =
    normalizedCities;

  return {
    isValid: true,
  };
}

module.exports = {
  validateAddStates,
  validateAddCities,
};