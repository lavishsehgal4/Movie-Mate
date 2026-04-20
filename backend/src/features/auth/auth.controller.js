const { signUpUser,loginUser } = require("./auth.service");

async function httpSignUpUser(req, res) {
  try {
    const { user, token } = await signUpUser(req.body);

    // 🔥 set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // 👉 true in production (HTTPS)
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // send response
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Signup failed",
    });
  }
}

async function httpLoginUser(req, res) {
  try {
    const { user, token } = await loginUser(req.body);

    // 🔥 set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // 👉 true in production
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      success: true,
      data: user,
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
  httpLoginUser
};