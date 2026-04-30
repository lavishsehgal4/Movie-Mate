const express = require("express");
const { httpAddFacility } = require("./facilities.controller");

const facilityRouter = express.Router();

facilityRouter.post("/add", httpAddFacility);

module.exports = facilityRouter;