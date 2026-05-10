const express = require("express");

const {
  httpCreateScreen,
  httpUpdateScreen,
  httpGetTheatreScreens,
} = require("./screen.controller");

const {
  verifyToken,
} = require("../../middlewares/auth.middleware");

const {
  attachTheatreRole,
  allowRoles,
} = require("../../middlewares/theatreRole.middleware");

const screenRouter = express.Router();

// =========================
// SCREEN ROUTES
// =========================

screenRouter.post(
  "/create",
  verifyToken,
  attachTheatreRole,
  allowRoles("OWNER", "MANAGER"),
  httpCreateScreen
);

screenRouter.patch(
  "/:screenId",
  verifyToken,
  attachTheatreRole,
  allowRoles("OWNER", "MANAGER"),
  httpUpdateScreen
);

screenRouter.get(
  "/",
  verifyToken,
  attachTheatreRole,
  allowRoles("OWNER", "MANAGER", "STAFF"),
  httpGetTheatreScreens
);

module.exports = screenRouter;