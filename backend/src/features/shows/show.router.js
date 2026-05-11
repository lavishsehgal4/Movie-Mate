const express = require("express");

const {
  httpCreateShows,
  httpGetScreenShows,
} = require("./show.controller");

const {
  verifyToken,
} = require("../../middlewares/auth.middleware");

const {
  attachTheatreRole,
  allowRoles,
} = require("../../middlewares/theatreRole.middleware");

const showRouter = express.Router();

// =========================
// SHOW ROUTES
// =========================

showRouter.post(
  "/create",
  verifyToken,
  attachTheatreRole,
  allowRoles("OWNER", "MANAGER"),
  httpCreateShows
);

showRouter.get(
  "/screen",
  verifyToken,
  attachTheatreRole,
  allowRoles("OWNER", "MANAGER", "STAFF"),
  httpGetScreenShows
);

module.exports = showRouter;