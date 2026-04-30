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

module.exports={
    createManyFacilities
}