const { signUpUser,loginUser,googleLogin,getCurrentUser  } = require("./auth.service");

const querystring = require("querystring");
const axios = require("axios");

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

async function httpLogoutUser(req, res) {
  try {
    // 🔥 clear cookie (must match login options)
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // 👉 true in production
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Logout failed",
    });
  }
}

function redirectToGoogle(req, res) {
  const baseURL = process.env.baseURL;

  const params = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
  };
  
  const url = `${baseURL}?${querystring.stringify(params)}`;

  res.redirect(url);
}

async function googleCallback(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      throw new Error("No code received from Google");
    }

    // 🔹 1. Exchange code → access token
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }
    );

    const { access_token } = tokenResponse.data;

    // 🔹 2. Fetch user
    const userResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const googleUser = userResponse.data;

    // 🔹 3. Login / signup
    const { user, token } = await googleLogin(googleUser);

    // 🔹 4. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // 👉 true in production
      sameSite: "lax", // 🔥 important for OAuth
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 🔥 5. Redirect to frontend (from env)
    res.redirect(process.env.FRONTEND_URL);

  } catch (error) {
    // optional: redirect with error flag
    res.redirect(`${process.env.FRONTEND_URL}/login?error=true`);
  }
}

async function httpGetCurrentUser(req, res) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await getCurrentUser(userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch user",
    });
  }
}

module.exports = {
  httpSignUpUser,
  httpLoginUser,
  httpLogoutUser,
  redirectToGoogle,
  googleCallback,
  httpGetCurrentUser
};