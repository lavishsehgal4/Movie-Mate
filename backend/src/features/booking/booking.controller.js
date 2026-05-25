const {createOrderService,verifyPaymentService,confirmBookingService,getUserBookingsService}=require('./booking.service');

async function httpCreateOrder(
  req,
  res
) {
  try {

    const result =
      await createOrderService(
        req.body,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Failed to create order",
    });
  }
}

async function httpVerifyPayment(
  req,
  res
) {
  try {

    const result =
      await verifyPaymentService(
        req.body,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Payment verification failed",
    });
  }
}

async function httpConfirmBooking(
  req,
  res
) {
  try {

    const result =
      await confirmBookingService(
        req.body,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Booking failed",
    });
  }
}


//get my boooking
async function httpGetUserBookings(
  req,
  res
) {
  try {

    const result =
      await getUserBookingsService(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch bookings",
    });
  }
}

module.exports={
    httpCreateOrder,
    httpVerifyPayment,
    httpConfirmBooking,
    httpGetUserBookings
}