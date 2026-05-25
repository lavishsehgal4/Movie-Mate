const {
  Prisma,
} = require(
  "@prisma/client"
);

const { prisma } = require("../../config/prisma");

// =========================
// fetch locked seats
// =========================

async function getLockedSeatsForOrder(
  tx,
  {
    showId,
    seatIds,
    userId,
  }
) {

  // =========================
  // deterministic ordering
  // =========================

  const sortedSeatIds =
    [...seatIds].sort(
      (a, b) => a - b
    );

  // =========================
  // lock rows
  // =========================

  const seats =
    await tx.$queryRaw`

      SELECT
        ss.id,
        ss.show_id,
        ss.seat_id,
        ss.status,
        ss.locked_by,
        ss.lock_until,

        s.price_multiplier,

        sh.base_price

      FROM "ShowSeat" ss

      JOIN "Seat" s
      ON s.id = ss.seat_id

      JOIN "Show" sh
      ON sh.id = ss.show_id

      WHERE
        ss.show_id = ${showId}
        AND ss.seat_id IN (${Prisma.join(sortedSeatIds)})

      ORDER BY ss.seat_id ASC

      FOR UPDATE
    `;

  // =========================
  // validate all seats exist
  // =========================

  if (
    seats.length !==
    sortedSeatIds.length
  ) {
    throw new Error(
      "Some seats do not exist"
    );
  }

  // =========================
  // validate locks
  // =========================

  for (const seat of seats) {

    if (
      seat.status !==
      "LOCKED"
    ) {
      throw new Error(
        "Some seats are not locked"
      );
    }

    if (
      seat.locked_by !==
      userId
    ) {
      throw new Error(
        "Seats locked by another user"
      );
    }

    if (
      !seat.lock_until ||
      new Date(
        seat.lock_until
      ) <= new Date()
    ) {
      throw new Error(
        "Seat lock expired"
      );
    }
  }

  return seats;
}

async function confirmBooking(
  tx,
  {
    showId,
    seatIds,
    userId,
    paymentId,
    totalAmount,
  }
) {

  // =========================
  // deterministic ordering
  // =========================

  const sortedSeatIds =
    [...seatIds].sort(
      (a, b) => a - b
    );

  // =========================
  // lock rows
  // =========================

  const seats =
    await tx.$queryRaw`

      SELECT
        ss.id,
        ss.seat_id,
        ss.status,
        ss.locked_by,
        ss.lock_until

      FROM "ShowSeat" ss

      WHERE
        ss.show_id = ${showId}
        AND ss.seat_id IN (${Prisma.join(sortedSeatIds)})

      ORDER BY ss.seat_id ASC

      FOR UPDATE
    `;

  // =========================
  // validate seats
  // =========================

  for (const seat of seats) {

    if (
      seat.status !==
      "LOCKED"
    ) {
      throw new Error(
        "Seat not locked"
      );
    }

    if (
      seat.locked_by !==
      userId
    ) {
      throw new Error(
        "Seat locked by another user"
      );
    }

    if (
      !seat.lock_until ||
      new Date(
        seat.lock_until
      ) <= new Date()
    ) {
      throw new Error(
        "Seat lock expired"
      );
    }
  }

  // =========================
  // create booking
  // =========================

  const booking =
    await tx.booking.create({
      data: {
        user_id: userId,

        show_id: showId,

        total_amount:
          totalAmount,

        status:
          "CONFIRMED",

        payment_status:
          "PAID",

        payment_id:
          paymentId,
      },
    });

  // =========================
  // update seats
  // =========================

  await tx.showSeat.updateMany({
    where: {
      show_id: showId,

      seat_id: {
        in: sortedSeatIds,
      },
    },

    data: {
      status: "BOOKED",

      locked_by: null,

      lock_until: null,
    },
  });

  // =========================
  // create junction rows
  // =========================

  await tx.bookingSeat.createMany({
    data: seats.map(
      (seat) => ({
        booking_id:
          booking.id,

        showSeat_id:
          seat.id,
      })
    ),
  });

  return booking;
}

// =========================
// confirm booking
// =========================

async function confirmBooking2nd(
  tx,
  {
    showId,
    seatIds,
    userId,
  }
) {

  // =========================
  // deterministic ordering
  // =========================

  const sortedSeatIds =
    [...seatIds].sort(
      (a, b) => a - b
    );

  // =========================
  // lock rows
  // =========================

  const seats =
    await tx.$queryRaw`

      SELECT
        ss.id,
        ss.show_id,
        ss.seat_id,
        ss.status,
        ss.locked_by,
        ss.lock_until,

        s.price_multiplier,

        sh.base_price

      FROM "ShowSeat" ss

      JOIN "Seat" s
      ON s.id = ss.seat_id

      JOIN "Show" sh
      ON sh.id = ss.show_id

      WHERE
        ss.show_id = ${showId}
        AND ss.seat_id IN (${Prisma.join(sortedSeatIds)})

      ORDER BY ss.seat_id ASC

      FOR UPDATE
    `;

  // =========================
  // validate all seats exist
  // =========================

  if (
    seats.length !==
    sortedSeatIds.length
  ) {
    throw new Error(
      "Some seats do not exist"
    );
  }

  // =========================
  // validate seat locks
  // =========================

  for (const seat of seats) {

    if (
      seat.status !==
      "LOCKED"
    ) {
      throw new Error(
        "Some seats are not locked"
      );
    }

    if (
      seat.locked_by !==
      userId
    ) {
      throw new Error(
        "Seats locked by another user"
      );
    }

    if (
      !seat.lock_until ||
      new Date(
        seat.lock_until
      ) <= new Date()
    ) {
      throw new Error(
        "Seat lock expired"
      );
    }
  }

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
  // create booking
  // =========================

  const booking =
    await tx.booking.create({
      data: {
        user_id: userId,

        show_id: showId,

        total_amount:
          total,

        status:
          "CONFIRMED",

        payment_status:
          "PAID",
      },
    });

  // =========================
  // update seats
  // =========================

  await tx.showSeat.updateMany({
    where: {
      show_id: showId,

      seat_id: {
        in: sortedSeatIds,
      },
    },

    data: {
      status: "BOOKED",

      locked_by: null,

      lock_until: null,
    },
  });

  // =========================
  // create bookingSeat rows
  // =========================

  await tx.bookingSeat.createMany({
    data: seats.map(
      (seat) => ({
        booking_id:
          booking.id,

        showSeat_id:
          seat.id,
      })
    ),
  });

  return booking;
}


//get bookings
async function getUserBookings(
  userId
) {
  try {

    return await prisma.booking.findMany({
      where: {
        user_id: userId,
      },

      orderBy: {
        created_at: "desc",
      },

      select: {
        id: true,

        total_amount: true,

        status: true,

        payment_status: true,

        created_at: true,

        show: {
          select: {
            start_time: true,

            language: true,

            format: true,

            movie: {
              select: {
                id: true,

                title: true,

                poster_path: true,
              },
            },

            theatre: {
              select: {
                theatre_name: true,

                city: true,

                state: true,
              },
            },
          },
        },

        bookingSeats: {
          select: {
            showSeat: {
              select: {
                seat: {
                  select: {
                    row_label: true,

                    seat_number: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  } catch (err) {

    console.error(
      "Error fetching bookings:",
      err
    );

    throw new Error(
      "Failed to fetch bookings"
    );
  }
}

module.exports = {
  getLockedSeatsForOrder,
  confirmBooking,
  confirmBooking2nd,
  getUserBookings
};