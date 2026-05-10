const express = require("express");

const {
  httpCreateSeatsForScreen,
  httpGetScreenSeatLayout,
  httpUpdateSeatStatus,
} = require("./seat.controller");

const {
  verifyToken,
} = require("../../middlewares/auth.middleware");

const {
  attachTheatreRole,
  allowRoles,
} = require("../../middlewares/theatreRole.middleware");

const seatRouter = express.Router();

// =========================
// SEAT ROUTES
// =========================

seatRouter.post(
  "/create",
  verifyToken,
  attachTheatreRole,
  allowRoles("OWNER", "MANAGER"),
  httpCreateSeatsForScreen
);

seatRouter.get(
  "/layout",
  verifyToken,
  attachTheatreRole,
  allowRoles("OWNER", "MANAGER", "STAFF"),
  httpGetScreenSeatLayout
);

seatRouter.patch(
  "/status",
  verifyToken,
  attachTheatreRole,
  allowRoles("OWNER", "MANAGER"),
  httpUpdateSeatStatus
);

module.exports = seatRouter;