const { signupWithPassword } = require("./auth.service");

async function httpSignUpUser(req, res) {
  try {
    // call service → it handles validation + hashing + DB
    const response = await signupWithPassword(req.body);

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Signup failed",
    });
  }
}

module.exports = {
  httpSignUpUser,
};

const { loginWithPassword } = require("./auth.service");

async function httpLoginUser(req, res) {
  try {
    const response = await loginWithPassword(req.body);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
}

module.exports = {
  httpSignUpUser,
  httpLoginUser,
};