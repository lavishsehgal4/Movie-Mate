const { validateCreateTheatre } = require("./theatre.validator");
const { createTheatreWithOwner,getUserTheatres } = require("./theatre.repository");

async function createTheatre(data, userId) {
  // 🔹 1. validate input
  const validation = validateCreateTheatre(data);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 🔹 2. create theatre + assign owner
  const theatre = await createTheatreWithOwner(data, userId);

  // 🔹 3. return clean response
  return {
    theatre: {
      id: theatre.id,
      theatre_name: theatre.theatre_name,
      city: theatre.city,
      state: theatre.state,
    },
  };
}

async function getMyTheatres(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const records = await getUserTheatres(userId);

  // 🔹 transform response (clean for frontend)
  const theatres = records.map((record) => ({
    theatreId: record.theatre.id,
    theatre_name: record.theatre.theatre_name,
    city: record.theatre.city,
    state: record.theatre.state,
    role: record.role,
  }));

  return theatres;
}

module.exports = {
  createTheatre,
  getMyTheatres
};