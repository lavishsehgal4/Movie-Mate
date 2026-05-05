const { validateCreateTheatre,validateAddFacilitiesToTheatre, validateGetTheatreById} = require("./theatre.validator");
const { createTheatreWithOwner,getUserTheatres,addFacilitiesToTheatre,getTheatreByIdForUser  } = require("./theatre.repository");
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

  // 🔹 transform response (clean + flat for frontend)
  const theatres = records.map((record) => ({
    theatreId: record.theatre.id,
    theatre_name: record.theatre.theatre_name,
    chain_name: record.theatre.chain_name,
    logo: record.theatre.chain_logo,
    city: record.theatre.city,
    state: record.theatre.state,
    total_screens: record.theatre.total_screens,
    rating:record.theatre.rating,
    created_at: record.theatre.created_at,
    is_verified: record.theatre.is_verified,
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

async function getTheatreById(data, userId) {
  // 🔹 1. validate input
  const validation = validateGetTheatreById(data);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  const { theatre_id } = data;

  // 🔹 2. repo call
  const record = await getTheatreByIdForUser(theatre_id, userId);

  // 🔹 3. handle no access / not found
  if (!record) {
    throw new Error("Theatre not found or access denied");
  }

  const theatre = record.theatre;

  // 🔹 4. clean response
  return {
    theatre: {
      id: theatre.id,
      theatre_name: theatre.theatre_name,
      chain_name: theatre.chain_name,
      chain_logo: theatre.chain_logo,

      state: theatre.state,
      city: theatre.city,
      address: theatre.address,

      contact_no: theatre.contact_no,
      email: theatre.email,

      total_screens: theatre.total_screens,
      rating: theatre.rating,

      opening_time: theatre.opening_time,
      closing_time: theatre.closing_time,

      is_active: theatre.is_active,
      is_verified: theatre.is_verified,

      created_at: theatre.created_at,
    },
    role: record.role, // 🔥 important for frontend decisions
  };
}

module.exports = {
  createTheatre,
  getMyTheatres,
  attachFacilitiesToTheatre,
  checkUserTheatreAccess,
  getTheatreById
};