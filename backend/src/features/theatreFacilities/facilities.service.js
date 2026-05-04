const { createManyFacilities,getAllFacilities } = require("./facilities.repository");
const { validateCreateFacility } = require("./facilities.validator");

async function addManyFacilities(data) {
  if (!Array.isArray(data.facilities) || data.facilities.length === 0) {
    throw new Error("Facilities array is required");
  }

  const cleaned = [];

  for (const item of data.facilities) {
    const validation = validateCreateFacility(item);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    cleaned.push({
      facility_name: item.facility_name,
      facility_logo: item.facility_logo || null,
    });
  }

  const result = await createManyFacilities(cleaned);

  return {
    message: "Facilities added successfully",
    count: result.count, // 🔥 useful
  };
}

async function fetchAllFacilities() {
  const facilities = await getAllFacilities();

  return facilities;
}

module.exports={
    addManyFacilities,
    fetchAllFacilities,
}