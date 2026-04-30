// ------------------ helpers ------------------

function normalizeString(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

// ------------------ field validators ------------------

function validateEmail(email) {
  if (typeof email !== "string") {
    return { isValid: false, error: "Email must be a string" };
  }

  const normalized = email.trim().toLowerCase();
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!emailRegex.test(normalized)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true, value: normalized };
}

function validatePhoneNo(phoneNumber) {
  if (typeof phoneNumber !== "string") {
    return { isValid: false, error: "Phone number must be a string" };
  }

  const normalized = phoneNumber.trim();

  if (!/^\d{10}$/.test(normalized)) {
    return { isValid: false, error: "Phone number must be 10 digits" };
  }

  return { isValid: true, value: normalized };
}

function normalizeNumber(value) {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

function validateRequiredString(value, fieldName) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, value: normalized };
}

function validateLatitude(lat) {
  const value = normalizeNumber(lat);
  if (value === null) return { isValid: true, value: null };

  if (value < -90 || value > 90) {
    return { isValid: false, error: "Invalid latitude" };
  }

  return { isValid: true, value };
}

function validateLongitude(lng) {
  const value = normalizeNumber(lng);
  if (value === null) return { isValid: true, value: null };

  if (value < -180 || value > 180) {
    return { isValid: false, error: "Invalid longitude" };
  }

  return { isValid: true, value };
}

function validateTime(date, fieldName) {
  if (!date) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { isValid: false, error: `Invalid ${fieldName}` };
  }

  return { isValid: true, value: parsed };
}

function validateCreateTheatre(data) {
  const temp = {};

  // theatre_name
  const name = validateRequiredString(data.theatre_name, "Theatre name");
  if (!name.isValid) return name;
  temp.theatre_name = name.value;

  // chain_name
  const chain = validateRequiredString(data.chain_name, "Chain name");
  if (!chain.isValid) return chain;
  temp.chain_name = chain.value;

  // chain_logo
  const logo = validateRequiredString(data.chain_logo, "Chain logo");
  if (!logo.isValid) return logo;
  temp.chain_logo = logo.value;

  // state
  const state = validateRequiredString(data.state, "State");
  if (!state.isValid) return state;
  temp.state = state.value;

  // city
  const city = validateRequiredString(data.city, "City");
  if (!city.isValid) return city;
  temp.city = city.value;

  // address
  const address = validateRequiredString(data.address, "Address");
  if (!address.isValid) return address;
  temp.address = address.value;

  // contact_no
  const phone = validatePhoneNo(data.contact_no);
  if (!phone.isValid) return phone;
  temp.contact_no = phone.value;

  // email
  const email = validateEmail(data.email);
  if (!email.isValid) return email;
  temp.email = email.value;

  // latitude
  const lat = validateLatitude(data.latitude);
  if (!lat.isValid) return lat;
  temp.latitude = lat.value;

  // longitude
  const lng = validateLongitude(data.longitude);
  if (!lng.isValid) return lng;
  temp.longitude = lng.value;

  // opening_time
  const open = validateTime(data.opening_time, "Opening time");
  if (!open.isValid) return open;
  temp.opening_time = open.value;

  // closing_time
  const close = validateTime(data.closing_time, "Closing time");
  if (!close.isValid) return close;
  temp.closing_time = close.value;

  // optional fields
  temp.total_screens = normalizeNumber(data.total_screens);
  temp.google_map_url = normalizeString(data.google_map_url) || null;
  temp.pincode = normalizeNumber(data.pincode);
  temp.landmark = normalizeString(data.landmark) || null;

  // ✅ final mutation
  Object.assign(data, temp);

  return { isValid: true };
}

module.exports={
    validateCreateTheatre,
}