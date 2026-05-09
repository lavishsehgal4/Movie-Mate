const { prisma } = require("../../config/prisma");

async function getUserRoleForTheatre(userId, theatreId) {
  try {
    return await prisma.theatreUser.findFirst({
      where: {
        user_id: userId,
        theatre_id: theatreId,
      },
      select: {
        role: true,
      },
    });
  } catch (err) {
    console.error("Error fetching theatre role:", err);
    throw new Error("Failed to fetch theatre role");
  }
}
module.exports={
    getUserRoleForTheatre
}