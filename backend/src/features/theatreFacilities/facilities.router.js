const express = require("express");
const { httpAddFacility,httpGetAllFacilities } = require("./facilities.controller");

const facilityRouter = express.Router();

facilityRouter.post("/add", httpAddFacility);
facilityRouter.get("/", httpGetAllFacilities);

module.exports = facilityRouter;