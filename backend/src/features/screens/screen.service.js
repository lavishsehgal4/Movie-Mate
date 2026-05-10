const {
  validateCreateScreen,
  validateUpdateScreen,
  validateGetTheatreScreens,
} = require("./screen.validator");

const {
  createScreen,
  updateScreen,
  getTheatreScreens,
} = require("./screen.repository");

// =========================
// CREATE SCREEN
// =========================

async function addScreen(data) {

  // 🔹 1. validate input
  const validation = validateCreateScreen(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 🔹 2. repo call
  const screen = await createScreen(data);

  // 🔹 3. return clean response
  return {
    screen,
  };
}

// =========================
// UPDATE SCREEN
// =========================

async function editScreen(screenId, data) {

  // 🔹 1. validate input
  const validation = validateUpdateScreen(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 🔹 2. repo call
  const updatedScreen = await updateScreen(
    screenId,
    data
  );

  // 🔹 3. return clean response
  return {
    screen: updatedScreen,
  };
}

// =========================
// GET THEATRE SCREENS
// =========================

async function fetchTheatreScreens(data) {

  // 🔹 1. validate input
  const validation = validateGetTheatreScreens(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 🔹 2. repo call
  const screens = await getTheatreScreens(
    data.theatre_id
  );

  // 🔹 3. return clean response
  return {
    screens,
  };
}

module.exports = {
  addScreen,
  editScreen,
  fetchTheatreScreens,
};