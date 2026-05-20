const { prisma } = require("../../config/prisma");

// we get all shows between given time range
async function getScreenShowsInRange(
  screenId,
  minStartTime,
  maxEndTime
) {
  try {

    return await prisma.show.findMany({
      where: {
        screen_id: screenId,

        start_time: {
          lt: maxEndTime,
        },

        end_time: {
          gt: minStartTime,
        },

        show_status: "scheduled",
      },

      select: {
        id: true,

        start_time: true,

        end_time: true,
      },
    });

  } catch (err) {
    console.error("Error fetching overlapping shows:", err);

    throw new Error(
      "Failed to fetch screen shows"
    );
  }
}


// create shows in bulk and alloting seats also in showseat table

async function createShowsWithSeats(shows, screenId) {
  try {

    return await prisma.$transaction(async (tx) => {

      // =========================
      // 1. fetch active seats
      // =========================

      const seats = await tx.seat.findMany({
        where: {
          screen_id: screenId,
          is_active: true,
        },

        select: {
          id: true,
        },
      });

      // =========================
      // 2. create shows
      // =========================

      const createdShows = [];

      for (const show of shows) {

        const createdShow = await tx.show.create({
          data: {
            movie_id: show.movie_id,

            theatre_id: show.theatre_id,

            screen_id: show.screen_id,

            start_time: show.start_time,

            end_time: show.end_time,

            language: show.language,

            format: show.format,

            city: show.city,

            base_price: show.base_price,
          },

          select: {
            id: true,
            
            theatre_id: true,

            movie_id: true,

            screen_id: true,

            language: true,

            format: true,

            show_status: true,

            start_time: true,

            end_time: true,

            base_price: true,
          },
        });

        createdShows.push(createdShow);
      }

      // =========================
      // 3. prepare show seats
      // =========================

      const showSeatData = [];

      for (const show of createdShows) {

        for (const seat of seats) {

          showSeatData.push({
            show_id: show.id,
            seat_id: seat.id,
          });
        }
      }

      // =========================
      // 4. bulk insert show seats
      // =========================

      await tx.showSeat.createMany({
        data: showSeatData,
      });

      // =========================
      // 5. return created shows
      // =========================

      return createdShows;
    });

  } catch (err) {

    console.error("Error creating shows:", err);

    throw new Error("Failed to create shows");
  }
}


// get shows with screenid thetreid and date

async function getScreenShowsByDate(
  screenId,
  startOfDay,
  endOfDay
) {
  try {

    return await prisma.show.findMany({
      where: {
        screen_id: screenId,

        start_time: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },

      select: {
        id: true,

        movie_id: true,

        theatre_id: true,

        screen_id: true,

        start_time: true,

        end_time: true,

        language: true,

        format: true,

        city: true,

        base_price: true,

        show_status: true,

        movie: {
          select: {
            id: true,

            title: true,

            poster_path: true,

            runtime: true,

            certification: true,
          },
        },
      },

      orderBy: {
        start_time: "asc",
      },
    });

  } catch (err) {

    console.error(
      "Error fetching screen shows:",
      err
    );

    throw new Error(
      "Failed to fetch screen shows"
    );
  }
}

// get movies in city by fetching shows of today in city

async function getMoviesByCities(cities) {

  try {

    // =========================
    // get unique movie ids
    // =========================

    const movieIds = await prisma.show.findMany({
      where: {
        city: {
          in: cities,
        },

        start_time: {
          gte: new Date(),
        },

        show_status: "scheduled",
      },

      distinct: ["movie_id"],

      select: {
        movie_id: true,
      },
    });

    // =========================
    // extract ids
    // =========================

    const ids = movieIds.map(
      (item) => item.movie_id
    );

    // =========================
    // fetch movies
    // =========================

    return await prisma.movie.findMany({
      where: {
        id: {
          in: ids,
        },
      },

      select: {
        id: true,

        title: true,

        original_title: true,

        poster_path: true,
      },
    });

  } catch (err) {

    console.error(
      "Error fetching movies by cities:",
      err
    );

    throw new Error(
      "Failed to fetch movies"
    );
  }
}


//get movies with radius of x km

async function getNearbyMovies(
  latitude,
  longitude,
  distanceInKm
) {
  try {

    // =========================
    // 1. get nearby theatres
    // =========================

    const nearbyTheatres =
      await prisma.$queryRaw`

      SELECT id
      FROM "Theatre"

      WHERE location IS NOT NULL

      AND ST_DWithin(
        location,

        ST_SetSRID(
          ST_MakePoint(
            ${longitude},
            ${latitude}
          ),
          4326
        )::geography,

        ${distanceInKm * 1000}
      )
    `;

    // =========================
    // 2. extract theatre ids
    // =========================

    const theatreIds =
      nearbyTheatres.map(
        (theatre) => theatre.id
      );

    if (theatreIds.length === 0) {
      return [];
    }

    // =========================
    // 3. get unique movie ids
    // =========================

    const movieIds =
      await prisma.show.findMany({
        where: {
          theatre_id: {
            in: theatreIds,
          },

          start_time: {
            gte: new Date(),
          },

          show_status: "scheduled",
        },

        distinct: ["movie_id"],

        select: {
          movie_id: true,
        },
      });

    // =========================
    // 4. extract ids
    // =========================

    const ids = movieIds.map(
      (item) => item.movie_id
    );

    // =========================
    // 5. fetch movies
    // =========================

    return await prisma.movie.findMany({
      where: {
        id: {
          in: ids,
        },
      },

      select: {
        id: true,

        title: true,

        original_title: true,

        poster_path: true,

      },
    });

  } catch (err) {

    console.error(
      "Error fetching nearby movies:",
      err
    );

    throw new Error(
      "Failed to fetch nearby movies"
    );
  }
}

//exports

module.exports={
    getScreenShowsInRange,
    createShowsWithSeats,
    getScreenShowsByDate,
    getMoviesByCities,
    getNearbyMovies,
}