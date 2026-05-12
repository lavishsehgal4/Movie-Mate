const { prisma } = require("../../config/prisma");

// =========================
// ADD STATES
// =========================

async function addStates(states) {
  try {

    return await prisma.state.createMany({
      data: states,

      skipDuplicates: true,
    });

  } catch (err) {

    console.error(
      "Error adding states:",
      err
    );

    throw new Error(
      "Failed to add states"
    );
  }
}

// =========================
// ADD CITIES
// =========================

// =========================
// ADD CITIES
// =========================

async function addCities(cities) {
  try {

    // =========================
    // 1. collect unique codes
    // =========================

    const stateCodes = [
      ...new Set(
        cities.map((city) =>
          city.state_code
        )
      ),
    ];

    // =========================
    // 2. fetch matching states
    // =========================

    const states = await prisma.state.findMany({
      where: {
        code: {
          in: stateCodes,
        },
      },

      select: {
        id: true,
        code: true,
      },
    });

    // =========================
    // 3. build code map
    // =========================

    const stateMap = {};

    for (const state of states) {
      stateMap[state.code] = state.id;
    }

    // =========================
    // 4. transform payload
    // =========================

    const cityData = [];

    for (const city of cities) {

      const stateId =
        stateMap[city.state_code];

      if (!stateId) {
        throw new Error(
          `Invalid state code: ${city.state_code}`
        );
      }

      cityData.push({
        name: city.name,

        state_id: stateId,

        is_default:
          city.is_default || false,
      });
    }

    // =========================
    // 5. insert cities
    // =========================

    return await prisma.city.createMany({
      data: cityData,

      skipDuplicates: true,
    });

  } catch (err) {

    console.error(
      "Error adding cities:",
      err
    );

    throw new Error(
      err.message || "Failed to add cities"
    );
  }
}

module.exports = {
  addStates,
  addCities,
};