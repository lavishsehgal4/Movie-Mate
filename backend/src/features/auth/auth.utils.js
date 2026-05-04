const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// 🔹 generate token
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d", // token valid for 1 day
  });
}


module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
};
