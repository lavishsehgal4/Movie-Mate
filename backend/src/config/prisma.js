const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function connectPrisma() {
  try {
    await prisma.$connect();
    console.log("Prisma connected successfully ✅");
  } catch (err) {
    console.error("Prisma connection failed ❌", err);
  }
}

module.exports = {
  prisma,
  connectPrisma,
};
