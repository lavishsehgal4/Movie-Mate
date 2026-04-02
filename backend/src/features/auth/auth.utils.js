const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// 🔹 hash password
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// 🔹 compare password (for login later)
async function comparePassword(plain, hashed) {
  return await bcrypt.compare(plain, hashed);
}

module.exports = {
  hashPassword,
  comparePassword,
};
