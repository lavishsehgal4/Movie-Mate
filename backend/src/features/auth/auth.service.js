function validateSignupData(data) {
  const {
    firstName,
    email,
    phoneNumber,
    dateOfBirth,
    password,
  } = data;

  // required fields
  if (!firstName  || !email || !phoneNumber || !dateOfBirth || !password) {
    throw new Error("All required fields must be provided");
  }

  // email format
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // phone number (basic check)
  if (!/^\d{10}$/.test(phoneNumber)) {
    throw new Error("Phone number must be 10 digits");
  }

  // password length
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // date validation
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) {
    throw new Error("Invalid date of birth");
  }

  return true;
}

module.exports = {
  validateSignupData,
};