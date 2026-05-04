const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    // 1. get token from cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token",
      });
    }

    // 2. verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. attach user info to request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
}

module.exports = {verifyToken};