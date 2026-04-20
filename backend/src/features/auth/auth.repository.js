const { prisma } = require("../../config/prisma");

// create user + auth (password already hashed before coming here)
async function addUserUsingPassword(data) {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      imageUrl,
      password,
    } = data;

    const user = await prisma.users.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        imageUrl,

        // create auth record
        auths: {
          create: {
            provider: "local",
            password: password,
          },
        },
      },

      // 🔒 YOU CONTROL WHAT GOES OUT
      select: {
        id: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        // 👉 if you want more fields, add here:
        // email: true,
        // phoneNumber: true,
        // imageUrl: true,
      },
    });

    return user;
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("User already exists");
    }

    throw new Error(err.message || "Failed to create user");
  }
}

async function findUserForLogin(identifier) {
  const result = await prisma.$queryRaw`
    SELECT 
      u.id,
      u."imageUrl",
      u."firstName",
      u."lastName",
      a."password"
    FROM "users" u
    INNER JOIN "auth" a
      ON u.id = a."userId"
    WHERE 
      a.provider = 'local'
      AND (
        u.email = ${identifier}
        OR u."phoneNumber" = ${identifier}
      )
    LIMIT 1;
  `;

  // result is array
  return result[0] || null;
}
module.exports = {
  addUserUsingPassword,
  findUserForLogin
};