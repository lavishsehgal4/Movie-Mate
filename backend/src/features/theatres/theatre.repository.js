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

      //adiing geo indexing
      if (
  createdTheatre.longitude &&
  createdTheatre.latitude
) {
  await tx.$executeRaw`
    UPDATE "Theatre"
    SET location =
      ST_SetSRID(
        ST_MakePoint(
          ${Number(createdTheatre.longitude)},
          ${Number(createdTheatre.latitude)}
        ),
        4326
      )::geography
    WHERE id = ${createdTheatre.id}
  `;
}

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
    const records = await prisma.theatreUser.findMany({
      where: {
        user_id: userId,
      },
      select: {
        role: true, // from TheatreUser

        theatre: {
          select: {
            id: true,
            theatre_name: true,
            chain_name: true,
            chain_logo: true, // logo
            city: true,
            state: true,
            total_screens: true,
            rating: true,
            created_at: true,
            is_verified: true,
          },
        },
      },
    });

    return records;
  } catch (error) {
    console.error("Error fetching user theatres:", error);
    throw new Error("Failed to fetch theatres");
  }
}

async function syncTheatreFacilities(theatreId, facilityIds) {
  try {
    return await prisma.$transaction(async (tx) => {

      // 🔹 1. remove facilities not present anymore
      await tx.theatreFacility.deleteMany({
        where: {
          theatre_id: theatreId,
          facility_id: {
            notIn: facilityIds,
          },
        },
      });

      // 🔹 2. prepare insert data
      const data = facilityIds.map((facilityId) => ({
        theatre_id: theatreId,
        facility_id: facilityId,
      }));

      // 🔹 3. add missing facilities
      const result = await tx.theatreFacility.createMany({
        data,
        skipDuplicates: true,
      });

      return result;
    });

  } catch (err) {
    console.error("Error syncing theatre facilities:", err);
    throw new Error("Failed to sync theatre facilities");
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

async function getTheatreByIdForUser(theatreId, userId) {
  try {
    const record = await prisma.theatreUser.findFirst({
      where: {
        theatre_id: theatreId,
        user_id: userId,
      },
      select: {
        role: true, // useful for future (OWNER / MANAGER / STAFF)

        theatre: {
          select: {
            id: true,
            theatre_name: true,
            chain_name: true,
            chain_logo: true,

            state: true,
            city: true,
            address: true,

            contact_no: true,
            email: true,

            total_screens: true,
            rating: true,

            opening_time: true,
            closing_time: true,

            is_active: true,
            is_verified: true,

            created_at: true,
          },
        },
      },
    });

    return record; // null if not found (important)
  } catch (error) {
    console.error("Error fetching theatre by id:", error);
    throw new Error("Failed to fetch theatre");
  }
}

async function getFacilitiesWithSelected(theatreId) {
  try {

    const [allFacilities, theatreFacilities] = await Promise.all([

      // 🔹 all available facilities
      prisma.facility.findMany({
        select: {
          id: true,
          facility_name: true,
          facility_logo: true,
        },
      }),

      // 🔹 theatre selected facilities
      prisma.theatreFacility.findMany({
        where: {
          theatre_id: theatreId,
        },

        select: {
          facility_id: true,
        },
      }),
    ]);

    return {
      allFacilities,
      selectedFacilities: theatreFacilities.map(
        (item) => item.facility_id
      ),
    };

  } catch (err) {
    console.error("Error fetching facilities:", err);
    throw new Error("Failed to fetch facilities");
  }
}

module.exports = { createTheatreWithOwner, getUserTheatres,syncTheatreFacilities,hasTheatreAccess
  ,getTheatreByIdForUser,getFacilitiesWithSelected
};