const { prisma } = require("../../config/prisma");

// creating screens

async function createScreen(data) {
  try {

    return await prisma.screen.create({
      data: {
        theatre_id: data.theatre_id,
        screen_name: data.screen_name,
        seat_layout: data.seat_layout || null,
      },

      select: {
        id: true,
        theatre_id: true,
        screen_name: true,
        created_at: true,
      },
    });

  } catch (err) {
    console.error("Error creating screen:", err);
    throw new Error("Failed to create screen");
  }
}

// updating screen

async function updateScreen(screenId, data) {
  try {

    return await prisma.screen.update({
      where: {
        id: screenId,
      },

      data: {
        screen_name: data.screen_name,
        seat_layout: data.seat_layout,
      },

      select: {
        id: true,
        theatre_id: true,
        screen_name: true,
        updated_at: true,
      },
    });

  } catch (err) {
    console.error("Error updating screen:", err);
    throw new Error("Failed to update screen");
  }
}

// getting all screens of one theatre

async function getTheatreScreens(theatreId) {
  try {

    return await prisma.screen.findMany({
      where: {
        theatre_id: theatreId,
      },

      select: {
        id: true,
        screen_name: true,
        created_at: true,
        updated_at: true,
      },
    });

  } catch (err) {
    console.error("Error fetching theatre screens:", err);
    throw new Error("Failed to fetch theatre screens");
  }
}


// seatLayouts operations

// adding seat_layout

async function updateScreenSeatLayout(screenId, seatLayout) {
  try {

    return await prisma.screen.update({
      where: {
        id: screenId,
      },

      data: {
        seat_layout: seatLayout,
      },

      select: {
        id: true,
        seat_layout: true,
        updated_at: true,
      },
    });

  } catch (err) {
    console.error("Error updating seat layout:", err);
    throw new Error("Failed to update seat layout");
  }
}

// exports

module.exports={
    createScreen,
    updateScreen,
    getTheatreScreens,
    updateScreenSeatLayout
}