const { hashPassword } = require("./auth.utils");
const { createUserWithAuth } = require("./auth.repository");

// your existing validator stays as it is
function validateSignupData(data) {
  const { firstName, email, phoneNumber, dateOfBirth, password } = data;

  if (!firstName || !email || !phoneNumber || !dateOfBirth || !password) {
    throw new Error("All required fields must be provided");
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  if (!/^\d{10}$/.test(phoneNumber)) {
    throw new Error("Phone number must be 10 digits");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) {
    throw new Error("Invalid date of birth");
  }

  return true;
}

// 🔥 ADD THIS
async function signupWithPassword(data) {
  // 1. validate input
  validateSignupData(data);

  // 2. convert date (keep data clean for repo)
  const formattedData = {
    ...data,
    dateOfBirth: new Date(data.dateOfBirth),
  };

    
  // 3. hash password
  const hashedPassword = await hashPassword(data.password);

  // 4. call repository (DB insert)
  return await createUserWithAuth({
    ...formattedData,
    password: hashedPassword,
  });
}

module.exports = {
  validateSignupData,
  signupWithPassword,
};