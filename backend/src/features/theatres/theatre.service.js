const { validateCreateTheatre,validateAddFacilitiesToTheatre  } = require("./theatre.validator");
const { createTheatreWithOwner,getUserTheatres,addFacilitiesToTheatre  } = require("./theatre.repository");
const{hasTheatreAccess}=require("./theatre.repository");

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

async function attachFacilitiesToTheatre(data) {
  // 🔹 1. validate input
  const validation = validateAddFacilitiesToTheatre(data);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const { theatre_id } = data;

  // 🔹 2. deduplicate
  const facilityIds = [...new Set(data.facility_ids)];

  // 🔹 3. repo call
  const result = await addFacilitiesToTheatre(theatre_id, facilityIds);

  // 🔹 4. clean response
  return {
    theatre_id,
    attached_count: result.count,
  };
}

async function checkUserTheatreAccess(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const hasAccess = await hasTheatreAccess(userId);

  return {
    hasTheatreAccess: hasAccess,
  };
}
module.exports = {
  createTheatre,
  getMyTheatres,
  attachFacilitiesToTheatre,
  checkUserTheatreAccess
};