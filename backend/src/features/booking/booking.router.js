const express = require("express");

const {
  verifyToken,
} = require("../../middlewares/auth.middleware");

const{httpCreateOrder,httpVerifyPayment,httpConfirmBooking,httpGetUserBookings}=require('./booking.controller');
const bookingRouter = express.Router();

bookingRouter.post(
  "/create-order",

  verifyToken,

  httpCreateOrder
);

bookingRouter.post(
  "/verify-payment",

  verifyToken,

  httpVerifyPayment
);

bookingRouter.post(
  "/confirm-booking",

  verifyToken,

  httpConfirmBooking
);

bookingRouter.get(
  "/my-bookings",

  verifyToken,

  httpGetUserBookings
);

module.exports=bookingRouter;
