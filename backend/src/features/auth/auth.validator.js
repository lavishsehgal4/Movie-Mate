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

function validatePassword(password) {
  if (typeof password !== "string") {
    return { isValid: false, error: "Password must be a string" };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }

  return { isValid: true, value: password };
}

function validateDob(dateOfBirth) {
  if (typeof dateOfBirth !== "string") {
    return { isValid: false, error: "Date of birth must be a string" };
  }

  const dob = new Date(dateOfBirth);

  if (isNaN(dob.getTime())) {
    return { isValid: false, error: "Invalid date of birth" };
  }

  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  if (age < 18) {
    return { isValid: false, error: "User must be at least 18 years old" };
  }

  return { isValid: true, value: dob };
}

// ------------------ main validators ------------------

function validateSignupData(data) {
  const {
    firstName,
    email,
    phoneNumber,
    dateOfBirth,
    password,
  } = data;

  // temp storage (NO mutation yet)
  const temp = {};

  // firstName
  const normalizedFirstName = normalizeString(firstName);
  if (!normalizedFirstName) {
    return { isValid: false, error: "First name is required" };
  }
  temp.firstName = normalizedFirstName;

  // email
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) return emailResult;
  temp.email = emailResult.value;

  // phone
  const phoneResult = validatePhoneNo(phoneNumber);
  if (!phoneResult.isValid) return phoneResult;
  temp.phoneNumber = phoneResult.value;

  // password
  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) return passwordResult;
  temp.password = passwordResult.value;

  // dob
  const dobResult = validateDob(dateOfBirth);
  if (!dobResult.isValid) return dobResult;
  temp.dateOfBirth = dobResult.value;

  // ✅ apply mutation only after ALL validations pass
  Object.assign(data, temp);

  return { isValid: true };
}

function validateLoginData(data) {
  const { identifier, password } = data;

  const temp = {};

  const normalizedIdentifier = normalizeString(identifier);
  if (!normalizedIdentifier) {
    return { isValid: false, error: "Identifier is required" };
  }

  const isEmailValid = validateEmail(normalizedIdentifier).isValid;
  const isPhoneValid = validatePhoneNo(normalizedIdentifier).isValid;

  if (!isEmailValid && !isPhoneValid) {
    return {
      isValid: false,
      error: "Identifier must be a valid email or phone number",
    };
  }

  temp.identifier = normalizedIdentifier;

  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) return passwordResult;

  temp.password = passwordResult.value;

  // ✅ apply mutation at end
  Object.assign(data, temp);

  return { isValid: true };
}


function validateUpdateUserProfile(data) {
  const temp = {};

  // 🔹 firstName (optional)
  if (data.firstName !== undefined) {
    const value = normalizeString(data.firstName);
    if (!value) {
      return { isValid: false, error: "First name cannot be empty" };
    }
    temp.firstName = value;
  }

  // 🔹 lastName (optional)
  if (data.lastName !== undefined) {
    const value = normalizeString(data.lastName);
    if (!value) {
      return { isValid: false, error: "Last name cannot be empty" };
    }
    temp.lastName = value;
  }

  // 🔹 dateOfBirth (optional)
  if (data.dateOfBirth !== undefined) {
    const dobResult = validateDob(data.dateOfBirth);
    if (!dobResult.isValid) return dobResult;
    temp.dateOfBirth = dobResult.value;
  }

  // 🔹 imageUrl (optional)
  if (data.imageUrl !== undefined) {
    const value = normalizeString(data.imageUrl);
    temp.imageUrl = value || null;
  }

  // 🔴 BLOCK fields (important)
  if (data.email !== undefined) {
    return { isValid: false, error: "Email cannot be updated here" };
  }

  if (data.phoneNumber !== undefined) {
    return { isValid: false, error: "Phone number cannot be updated here" };
  }

  if (data.password !== undefined) {
    return { isValid: false, error: "Password cannot be updated here" };
  }

  // 🔹 apply mutation only at end
  Object.assign(data, temp);

  return { isValid: true };
}
module.exports = {
  validateSignupData,
  validateLoginData,
  validateUpdateUserProfile
};