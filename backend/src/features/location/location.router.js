const express = require("express");

const {
  getAllLocationsController,
} = require("./location.controller");

const locationRouter = express.Router();

locationRouter.get("/", getAllLocationsController);

module.exports = locationRouter;