function validateSignupData(data) {
  const {
    firstName,
    email,
    phoneNumber,
    dateOfBirth,
    password,
  } = data;

  // 🔹 required fields
  if (!firstName || !email || !phoneNumber || !dateOfBirth || !password) {
    throw new Error("All required fields must be provided");
  }

  // 🔹 email format
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // 🔹 phone number (10 digits)
  if (!/^\d{10}$/.test(phoneNumber)) {
    throw new Error("Phone number must be 10 digits");
  }

  // 🔹 password length
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // 🔹 valid date
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) {
    throw new Error("Invalid date of birth");
  }

  // 🔹 age >= 18 check
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
    throw new Error("User must be at least 18 years old");
  }

  return true;
}

function validateLoginData(data) {
  const { identifier, password } = data;

  // 🔹 required fields
  if (!identifier || !password) {
    throw new Error("Identifier and password are required");
  }

  // 🔹 basic sanity check for identifier
  if (typeof identifier !== "string") {
    throw new Error("Invalid identifier");
  }

  // trim input
  const trimmedIdentifier = identifier.trim();

  if (trimmedIdentifier.length === 0) {
    throw new Error("Identifier cannot be empty");
  }

  // 🔹 optional: simple format check (not strict)
  const isEmail = /^\S+@\S+\.\S+$/.test(trimmedIdentifier);
  const isPhone = /^\d{10}$/.test(trimmedIdentifier);

  if (!isEmail && !isPhone) {
    throw new Error("Identifier must be a valid email or phone number");
  }

  // 🔹 password check
  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Invalid password");
  }

  return true;
}
module.exports = {
  validateSignupData,
  validateLoginData
};