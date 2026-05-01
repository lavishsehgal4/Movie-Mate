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

async function getUserTheatres(userId) {
  try {
    const theatres = await prisma.theatreUser.findMany({
      where: {
        user_id: userId,
      },
      include: {
        theatre: {
          select: {
            id: true,
            theatre_name: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return theatres;
  } catch (error) {
    console.error("Error fetching user theatres:", error);
    throw new Error("Failed to fetch theatres");
  }
}

async function addFacilitiesToTheatre(theatreId, facilityIds) {
  try {
    const data = facilityIds.map((facilityId) => ({
      theatre_id: theatreId,
      facility_id: facilityId,
    }));

    return await prisma.theatreFacility.createMany({
      data,
      skipDuplicates: true, // rely on DB to ignore duplicates
    });
  } catch (err) {
    console.error("Error attaching facilities:", err);
    throw new Error("Failed to attach facilities to theatre");
  }
}

async function hasTheatreAccess(userId) {
  try {
    const record = await prisma.theatreUser.findFirst({
      where: { user_id: userId },
      select: { user_id: true }, // minimal data
    });

    return !!record;
  } catch (err) {
    throw new Error("Failed to check theatre access");
  }
}

module.exports = { createTheatreWithOwner, getUserTheatres,addFacilitiesToTheatre,hasTheatreAccess};