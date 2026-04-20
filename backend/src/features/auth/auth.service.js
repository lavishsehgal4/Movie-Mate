const { validateSignupData,validateLoginData } = require("./auth.validator");
const { hashPassword ,comparePassword} = require("./auth.utils");
const { addUserUsingPassword,findUserForLogin } = require("./auth.repository");
const { generateToken } = require("./auth.utils");

async function signUpUser(data) {
  // 🔹 1. validate input
  validateSignupData(data);

  // 🔹 2. prepare data (convert date)
  const formattedData = {
    ...data,
    dateOfBirth: new Date(data.dateOfBirth),
  };

  // 🔹 3. hash password
  const hashedPassword = await hashPassword(data.password);

  // 🔹 4. send to repository
  const user = await addUserUsingPassword({
    ...formattedData,
    password: hashedPassword,
  });
  
   // 🔥 5. generate JWT (auto login)
  const token = generateToken({ userId: user.id });

  // 6. return both
  return {
    user,
    token,
  };
}

async function loginUser(data) {
  // 🔹 1. validate input
  validateLoginData(data);

  const { identifier, password } = data;

  // 🔹 2. fetch user (with hashed password)
  const record = await findUserForLogin(identifier);

  // 🔹 3. check if user exists
  if (!record) {
    throw new Error("Invalid credentials");
  }

  // 🔹 4. compare password
  const isMatch = await comparePassword(password, record.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // 🔹 5. generate JWT
  const token = generateToken({ userId: record.id });

  // 🔹 6. return safe user data + token
  return {
    user: {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      imageUrl: record.imageUrl,
    },
    token,
  };
}

module.exports = {
  signUpUser,
  loginUser
};