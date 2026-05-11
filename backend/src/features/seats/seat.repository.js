const { prisma } = require("../../config/prisma");


// creates seats for a screen

async function createSeatsForScreen(screenId, seats) {
  try {

    const data = seats.map((seat) => ({
      screen_id: screenId,

      row_label: seat.row_label,

      seat_number: seat.seat_number,

      seat_type: seat.seat_type,

      price_multiplier:
        seat.price_multiplier || 1.00,
    }));

    return await prisma.seat.createMany({
      data,
      skipDuplicates: true,
    });

  } catch (err) {
    console.error("Error creating seats:", err);
    throw new Error("Failed to create seats");
  }
}

// fetching seats json +deactivated seat using join

async function getScreenSeatLayout(screenId) {
  try {

    return await prisma.screen.findUnique({
      where: {
        id: screenId,
      },

      select: {
        id: true,

        seat_layout: true,

        seats: {
          where: {
            is_active: false,
          },

          select: {
            row_label: true,
            seat_number: true,
          },
        },
      },
    });

  } catch (err) {
    console.error("Error fetching screen seats:", err);
    throw new Error("Failed to fetch screen seats");
  }
}

// setting seat is_active to true/false

async function updateSeatStatus(data) {
  try {

    const conditions = data.seats.map((seat) => ({
      screen_id: data.screen_id,

      row_label: seat.row_label,

      seat_number: seat.seat_number,
    }));

    return await prisma.seat.updateMany({
      where: {
        OR: conditions,
      },

      data: {
        is_active: data.is_active,
      },
    });

  } catch (err) {
    console.error("Error updating seat status:", err);
    throw new Error("Failed to update seat status");
  }
}

//exports

module.exports={
    createSeatsForScreen,
    getScreenSeatLayout,
    updateSeatStatus
}