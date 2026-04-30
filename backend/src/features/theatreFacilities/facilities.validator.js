function normalizeString(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function validateCreateFacility(data) {
  const temp = {};

  const name = normalizeString(data.facility_name);
  if (!name) {
    return { isValid: false, error: "Facility name is required" };
  }

  temp.facility_name = name;
  temp.facility_logo = normalizeString(data.facility_logo) || null;

  Object.assign(data, temp);

  return { isValid: true };
}

module.exports = {
  validateCreateFacility,
};