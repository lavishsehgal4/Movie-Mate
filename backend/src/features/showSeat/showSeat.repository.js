const { prisma } = require("../../config/prisma");
const {
  Prisma,
} = require(
  "@prisma/client"
);

async function updateSeatLocks(
  tx,
  {
    showId,
    seatIds,
    userId,
    action,
  }
) {

  // =========================
  // 0. deterministic ordering
  // =========================

  const sortedSeatIds =
    [...seatIds].sort(
      (a, b) => a - b
    );

  // =========================
  // 1. lock rows
  // =========================

  const seats =
    await tx.$queryRaw`

      SELECT
        id,
        seat_id,
        status,
        locked_by,
        lock_until
      FROM "ShowSeat"
      WHERE
        show_id = ${showId}
        AND seat_id IN (${Prisma.join(sortedSeatIds)})
      ORDER BY seat_id ASC
      FOR UPDATE
    `;

  // =========================
  // 2. validate seat count
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
  // 3. LOCK seats
  // =========================

  if (action === "LOCK") {

    for (const seat of seats) {

      // already booked
      if (
        seat.status === "BOOKED"
      ) {
        throw new Error(
          "Some seats already booked"
        );
      }

      // active lock by another user
      if (
        seat.status === "LOCKED" &&
        seat.locked_by !== userId &&
        seat.lock_until &&
        new Date(seat.lock_until) >
          new Date()
      ) {
        throw new Error(
          "Some seats already locked"
        );
      }
    }

    // =========================
    // lock all seats
    // =========================

    await tx.showSeat.updateMany({
      where: {
        show_id: showId,

        seat_id: {
          in: sortedSeatIds,
        },
      },

      data: {
        status: "LOCKED",

        locked_by: userId,

        lock_until:
          new Date(
            Date.now() +
            5 * 60 * 1000
          ),
      },
    });

    return;
  }

  // =========================
  // 4. UNLOCK seats
  // =========================

  if (action === "UNLOCK") {

    for (const seat of seats) {

      if (
        seat.status === "LOCKED" &&
        seat.locked_by !== userId &&
        seat.lock_until &&
        new Date(seat.lock_until) >
          new Date()
      ) {
        throw new Error(
          "Cannot unlock another user's seats"
        );
      }
    }

    // =========================
    // unlock seats
    // =========================

    await tx.showSeat.updateMany({
      where: {
        show_id: showId,

        seat_id: {
          in: sortedSeatIds,
        },
      },

      data: {
        status: "AVAILABLE",

        locked_by: null,

        lock_until: null,
      },
    });

    return;
  }

  throw new Error(
    "Invalid action"
  );
}


async function getActiveSeatLocks(
  userId
) {
  try {

    const locks =
      await prisma.showSeat.findMany({
        where: {
          locked_by: userId,

          status: "LOCKED",

          lock_until: {
            gt: new Date(),
          },
        },

        select: {
          show_id: true,

          seat_id: true,

          lock_until: true,

          show: {
            select: {
              id: true,

              movie: {
                select: {
                  id: true,

                  title: true,
                },
              },

              theatre: {
                select: {
                  theatre_name: true,

                  chain_logo: true,

                  city: true,

                  state: true,
                },
              },
            },
          },
        },
      });

    // =========================
    // group by show_id
    // =========================

    const groupedLocks = {};

    for (const lock of locks) {

      if (
        !groupedLocks[
          lock.show_id
        ]
      ) {

        groupedLocks[
          lock.show_id
        ] = {
          show_id:
            lock.show_id,

          seat_ids: [],

          seat_count: 0,

          lock_until:
            lock.lock_until,

          theatre:
            lock.show.theatre,

          movie:
            lock.show.movie,
        };
      }

      groupedLocks[
        lock.show_id
      ].seat_count += 1;

      groupedLocks[
        lock.show_id
      ].seat_ids.push(
        lock.seat_id
      );
    }

    return Object.values(
      groupedLocks
    );

  } catch (err) {

    console.error(
      "Error fetching active seat locks:",
      err
    );

    throw new Error(
      "Failed to fetch active seat locks"
    );
  }
}

module.exports={
    updateSeatLocks,
    getActiveSeatLocks,
}