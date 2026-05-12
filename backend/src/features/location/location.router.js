const express = require("express");

const {
  httpAddStates,
  httpAddCities,
} = require("./location.controller");

const locationRouter = express.Router();

// =========================
// LOCATION ROUTES
// =========================

locationRouter.post(
  "/states",
  httpAddStates
);

locationRouter.post(
  "/cities",
  httpAddCities
);

module.exports = locationRouter;