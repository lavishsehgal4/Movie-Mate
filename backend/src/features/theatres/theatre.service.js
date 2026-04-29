const { validateCreateTheatre } = require("./theatre.validator");
const { createTheatreWithOwner } = require("./theatre.repository");

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

module.exports = {
  createTheatre,
};