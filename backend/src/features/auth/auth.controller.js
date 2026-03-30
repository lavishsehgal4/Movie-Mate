const { signupWithPassword } = require("./auth.repository");
const { validateSignupData } = require("./auth.service");

async function httpSignUpUser(req, res) {
  try {
    const data = req.body;
    validateSignupData(data);
    const response = await signupWithPassword(data);

    res.status(201).json(response);
  } catch (error) {
    // handle known errors
    res.status(400).json({
      success: false,
      message: error.message || "Signup failed",
    });
  }
}

module.exports = {
  httpSignUpUser,
};
