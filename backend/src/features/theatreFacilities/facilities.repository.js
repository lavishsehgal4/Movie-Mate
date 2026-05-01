const { prisma } = require("../../config/prisma");

async function createManyFacilities(data) {
  try {
    return await prisma.facility.createMany({
      data,
      skipDuplicates: true, // 🔥 important
    });
  } catch (err) {
    throw new Error("Failed to create facilities");
  }
}

async function getAllFacilities() {
  try {
    const facilities = await prisma.facility.findMany({
      select: {
        id: true,
        facility_name: true,
        facility_logo: true,
      }
    });

    return facilities;
  } catch (err) {
    throw new Error("Failed to fetch facilities");
  }
}

module.exports={
    createManyFacilities,
    getAllFacilities
}