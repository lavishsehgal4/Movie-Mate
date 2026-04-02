const { prisma } = require("../../config/prisma");

async function createUserWithAuth(data) {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      imageUrl,
      password, // hashed
    } = data;

    const user = await prisma.users.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        imageUrl,

        // create auth (not returned)
        auths: {
          create: {
            provider: "local",
            password: password,
          },
        },
      },

      // 🔒 return ONLY what you want
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth:true,
        imageUrl:true,
      },
    });

    return user;
  } catch (err) {
    if (err.code === "P2002") {
      throw new Error("Email already exists");
    }

    throw new Error(err.message || "Failed to create user");
  }
}

module.exports = {
  createUserWithAuth,
};