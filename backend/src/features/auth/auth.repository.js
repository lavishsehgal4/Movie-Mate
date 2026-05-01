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
  const record = await prisma.auth.findFirst({
    where: {
      provider: "local",
      OR: [
        { user: { email: identifier } },
        { user: { phoneNumber: identifier } },
      ],
    },
    select: {
      password: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!record) return null;

  return {
    id: record.user.id,
    firstName: record.user.firstName,
    lastName: record.user.lastName,
    imageUrl: record.user.imageUrl,
    password: record.password,
  };
}



async function findGoogleUser(googleId) {
  return await prisma.auth.findFirst({
    where: {
      provider: "google",
      providerKey: googleId,
    },
    include: {
      user: true,
    },
  });
}

async function createGoogleUser(googleUser) {
  return await prisma.users.create({
    data: {
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      email: googleUser.email,
      imageUrl: googleUser.picture,

      auths: {
        create: {
          provider: "google",
          providerKey: googleUser.id,
        },
      },
    },
  });
}

async function getUserById(userId) {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        imageUrl: true,
        dateOfBirth: true,
        createdAt: true,
      },
    });

    return user;
  } catch (err) {
    throw new Error("Failed to fetch user");
  }
}

module.exports = {
  addUserUsingPassword,
  findUserForLogin,
  findGoogleUser,
  createGoogleUser,
  getUserById
};