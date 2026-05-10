// ------------------ helpers ------------------

function normalizeString(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeNumber(value) {
  const num = Number(value);

  if (isNaN(num) || num <= 0) {
    return null;
  }

  return num;
}

// ------------------ main validators ------------------

function validateCreateScreen(data) {
  const temp = {};

  // theatre_id
  const theatreId = normalizeNumber(data.theatre_id);

  if (!theatreId) {
    return {
      isValid: false,
      error: "Valid theatre_id is required",
    };
  }

  temp.theatre_id = theatreId;

  // screen_name
  const screenName = normalizeString(data.screen_name);

  if (!screenName) {
    return {
      isValid: false,
      error: "screen_name is required",
    };
  }

  temp.screen_name = screenName;

  // seat_layout (optional)
  if (data.seat_layout !== undefined) {
    temp.seat_layout = data.seat_layout;
  }

  // apply mutation
  Object.assign(data, temp);

  return { isValid: true };
}

function validateUpdateScreen(data) {
  const temp = {};

  // screen_name (optional)
  if (data.screen_name !== undefined) {
    const screenName = normalizeString(data.screen_name);

    if (!screenName) {
      return {
        isValid: false,
        error: "screen_name cannot be empty",
      };
    }

    temp.screen_name = screenName;
  }

  // seat_layout (optional)
  if (data.seat_layout !== undefined) {
    temp.seat_layout = data.seat_layout;
  }

  // prevent empty updates
  if (Object.keys(temp).length === 0) {
    return {
      isValid: false,
      error: "No valid fields provided for update",
    };
  }

  // apply mutation
  Object.assign(data, temp);

  return { isValid: true };
}

function validateGetTheatreScreens(data) {
  const temp = {};

  const theatreId = normalizeNumber(data.theatre_id);

  if (!theatreId) {
    return {
      isValid: false,
      error: "Valid theatre_id is required",
    };
  }

  temp.theatre_id = theatreId;

  // apply mutation
  Object.assign(data, temp);

  return { isValid: true };
}

module.exports = {
  validateCreateScreen,
  validateUpdateScreen,
  validateGetTheatreScreens,
};