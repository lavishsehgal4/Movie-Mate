const {
  prisma,
} = require(
  "../../config/prisma"
);

const {
  razorpay,
} = require(
  "../../config/razorpay"
);

const crypto =
  require("crypto");


const{validateCreateOrder,
  validateVerifyPayment,validateConfirmBooking}=require('./booking.validator');

  const{getLockedSeatsForOrder,
  confirmBooking,confirmBooking2nd,
  getUserBookings
}=require('./booking.repository');

async function createOrderService(
  data,
  userId
) {

  // =========================
  // validate
  // =========================

  const validation =
    validateCreateOrder(
      data
    );

  if (!validation.isValid) {
    throw new Error(
      validation.error
    );
  }

  // =========================
  // transaction
  // =========================

  const seats =
    await prisma.$transaction(
      async (tx) => {

        return await getLockedSeatsForOrder(
          tx,
          {
            showId:
              data.show_id,

            seatIds:
              data.seat_ids,

            userId,
          }
        );
      }
    );

  // =========================
  // calculate amount
  // =========================

  let total = 0;

  for (const seat of seats) {

    total +=
      Number(
        seat.base_price
      ) *
      Number(
        seat.price_multiplier
      );
  }

  // =========================
  // razorpay amount
  // in paise
  // =========================

  const amount =
    Math.round(
      total * 100
    );

  // =========================
  // create razorpay order
  // =========================

  const order =
    await razorpay.orders.create({
      amount,

      currency: "INR",

      receipt:
        `show_${data.show_id}_${Date.now()}`,
    });

  // =========================
  // return response
  // =========================

  return {
    order_id:
      order.id,

    amount,

    currency:
      order.currency,

    key:
      process.env
        .RAZORPAY_KEY_ID,
  };
}

async function verifyPaymentService(
  data,
  userId
) {

  // =========================
  // validate
  // =========================

  const validation =
    validateVerifyPayment(
      data
    );

  if (!validation.isValid) {
    throw new Error(
      validation.error
    );
  }

  // =========================
  // verify signature
  // =========================

  const generatedSignature =
    crypto
      .createHmac(
        "sha256",
        process.env
          .RAZORPAY_KEY_SECRET
      )
      .update(
        `${data.razorpay_order_id}|${data.razorpay_payment_id}`
      )
      .digest("hex");

  if (
    generatedSignature !==
    data.razorpay_signature
  ) {
    throw new Error(
      "Invalid payment signature"
    );
  }

  // =========================
  // fetch seats again
  // =========================

  const seats =
    await prisma.$transaction(
      async (tx) => {

        return await getLockedSeatsForOrder(
          tx,
          {
            showId:
              data.show_id,

            seatIds:
              data.seat_ids,

            userId,
          }
        );
      }
    );

  // =========================
  // calculate total
  // =========================

  let total = 0;

  for (const seat of seats) {

    total +=
      Number(
        seat.base_price
      ) *
      Number(
        seat.price_multiplier
      );
  }

  // =========================
  // confirm booking
  // =========================

  const booking =
    await prisma.$transaction(
      async (tx) => {

        return await confirmBooking(
          tx,
          {
            showId:
              data.show_id,

            seatIds:
              data.seat_ids,

            userId,

            paymentId:
              data.razorpay_payment_id,

            totalAmount:
              total,
          }
        );
      }
    );

  return {
    booking_id:
      booking.id,
  };
}

async function confirmBookingService(
  data,
  userId
) {

  // =========================
  // validate
  // =========================

  const validation =
    validateConfirmBooking(
      data
    );

  if (!validation.isValid) {
    throw new Error(
      validation.error
    );
  }

  // =========================
  // transaction
  // =========================

  const booking =
    await prisma.$transaction(
      async (tx) => {

        return await confirmBooking2nd(
          tx,
          {
            showId:
              data.show_id,

            seatIds:
              data.seat_ids,

            userId,
          }
        );
      }
    );

  // =========================
  // return response
  // =========================

  return {
    booking_id:
      booking.id,

    total_amount:
      Number(
        booking.total_amount
      ),

    message:
      "Booking confirmed successfully",
  };
}

async function getUserBookingsService(
  userId
) {

  const bookings =
    await getUserBookings(
      userId
    );

  return {
    bookings:
      bookings.map(
        (booking) => ({
          booking_id:
            booking.id,

          total_amount:
            Number(
              booking.total_amount
            ),

          status:
            booking.status,

          payment_status:
            booking.payment_status,

          created_at:
            booking.created_at,

          movie: {
            ...booking.show.movie,

            poster_path:
              booking.show.movie
                .poster_path
                ? `${process.env.TMDB_IMAGE_BASE}${booking.show.movie.poster_path}`
                : null,
          },

          theatre:
            booking.show.theatre,

          show: {
            start_time:
              booking.show.start_time,

            language:
              booking.show.language,

            format:
              booking.show.format,
          },

          seats:
            booking.bookingSeats.map(
              (seat) => ({
                row_label:
                  seat.showSeat
                    .seat
                    .row_label,

                seat_number:
                  seat.showSeat
                    .seat
                    .seat_number,
              })
            ),
        })
      ),
  };
}

module.exports={
    createOrderService
    ,verifyPaymentService,
    confirmBookingService,
    getUserBookingsService,
    

}