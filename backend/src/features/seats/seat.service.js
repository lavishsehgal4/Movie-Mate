const {
  validateCreateSeats,
  validateGetScreenSeatLayout,
  validateUpdateSeatStatus,
} = require("./seat.validator");

const {
  createSeatsForScreen,
  getScreenSeatLayout,
  updateSeatStatus
} = require("./seat.repository");

const {
  updateScreenSeatLayout,
} = require("../screens/screen.repository");

// =========================
// CREATE SEATS
// =========================

async function addSeatsToScreen(data) {

  // 🔹 1. validate input
  const validation = validateCreateSeats(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 🔹 2. save seat layout json
  await updateScreenSeatLayout(
    data.screen_id,
    data.seat_layout
  );

  // 🔹 3. insert normalized seats
  const result = await createSeatsForScreen(
    data.screen_id,
    data.normalizedSeats
  );

  // 🔹 4. return clean response
  return {
    screen_id: data.screen_id,

    created_count: result.count,
  };
}

// =========================
// GET SCREEN SEAT LAYOUT
// =========================

async function fetchScreenSeatLayout(data) {

  // 🔹 1. validate input
  const validation =
    validateGetScreenSeatLayout(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 🔹 2. repo call
  const result = await getScreenSeatLayout(
    data.screen_id
  );

  // 🔹 3. return clean response
  return {
    screen: result,
  };
}


// =========================
// update seat status(true/false)
// =========================

async function changeSeatStatus(data) {

  // validate
  const validation =
    validateUpdateSeatStatus(data);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // repo call
  const result = await updateSeatStatus(
    data
  );

  // response
  return {
    updated_count: result.count,
  };
}


module.exports = {
  addSeatsToScreen,
  fetchScreenSeatLayout,
  changeSeatStatus,
};