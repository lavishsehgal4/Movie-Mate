const { prisma } = require("../../config/prisma");

async function signupWithPassword(data) {
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

    return await prisma.users.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth: new Date(dateOfBirth),
        imageUrl,

        auths: {
          create: {
            provider: "local",
            password: password,
          },
        },
      },
      include: {
        auths: true,
      },
    });
  } catch (err) {
    // handle known DB errors
    if (err.code === "P2002") {
      throw new Error("Email already exists");
    }

    // fallback
    throw new Error("Failed to create user");
  }
}

module.exports = {
  signupWithPassword,
};
