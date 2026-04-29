const { prisma } = require("../../config/prisma");



async function createTheatreWithOwner(data, userId) {
  try {
    const theatre = await prisma.$transaction(async (tx) => {
      const createdTheatre = await tx.theatre.create({
        data: {
          theatre_name: data.theatre_name,
          chain_name: data.chain_name,
          chain_logo: data.chain_logo,

          state: data.state,
          city: data.city,
          address: data.address,

          longitude: data.longitude || null,
          latitude: data.latitude || null,

          contact_no: data.contact_no,
          email: data.email,

          total_screens: data.total_screens || null,

          is_active: true,

          rating: null,
          google_map_url: data.google_map_url || null,

          opening_time: data.opening_time,
          closing_time: data.closing_time,

          pincode: data.pincode || null,
          landmark: data.landmark || null,
        },
      });

      await tx.theatreUser.create({
        data: {
          user_id: userId,
          theatre_id: createdTheatre.id,
          role: "OWNER",
        },
      });

      return createdTheatre;
    });

    return theatre;
  } catch (error) {
    // 🔥 Log properly (don’t ignore errors)
    console.error("Error creating theatre:", error);

    // Throw clean error upward
    throw new Error("Failed to create theatre");
  }
}

module.exports = { createTheatreWithOwner };