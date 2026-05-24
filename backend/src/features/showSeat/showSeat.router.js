const express = require("express");

const {
  verifyToken,
} = require("../../middlewares/auth.middleware");

const{httpUpdateSeatLocks,httpGetActiveSeatLocks}=require('./showSeat.controller');
const showSeatRouter = express.Router();

showSeatRouter.post(
  "/seat-lock",

  verifyToken,

  httpUpdateSeatLocks
);

showSeatRouter.get(
  "/active-seat-locks",

  verifyToken,

  httpGetActiveSeatLocks
);

module.exports=showSeatRouter;