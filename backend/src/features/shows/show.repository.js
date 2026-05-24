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


//


async function getMovieShowsByCities(
  movieId,
  cities
) {
  try {

    return await prisma.show.findMany({
      where: {
        movie_id: movieId,

        city: {
          in: cities,
        },

        start_time: {
          gte: new Date(),
        },

        show_status: "scheduled",
      },

      select: {
        id: true,

        theatre_id: true,

        screen_id: true,

        start_time: true,

        end_time: true,

        language: true,

        format: true,

        base_price: true,

        theatre: {
          select: {
            id: true,

            theatre_name: true,

            chain_name: true,

            chain_logo: true,

            address: true,

            city: true,

            state: true,

            theatreFacilities: {
              select: {
                facility: {
                  select: {
                    id: true,

                    facility_name: true,

                    facility_logo: true,
                  },
                },
              },
            },
          },
        },
      },

      orderBy: [
        {
          theatre_id: "asc",
        },
        {
          start_time: "asc",
        },
      ],
    });

  } catch (err) {

    console.error(
      "Error fetching movie shows:",
      err
    );

    throw new Error(
      "Failed to fetch movie shows"
    );
  }
}


// shows of movies by coordinates and movie_id

async function getNearbyMovieShows(
  movieId,
  latitude,
  longitude
) {
  try {

    // =========================
    // 1. get nearby theatres
    // =========================

    const nearbyTheatres =
      await prisma.$queryRaw`

      SELECT
        id,

        ST_Distance(
          location,

          ST_SetSRID(
            ST_MakePoint(
              ${longitude},
              ${latitude}
            ),
            4326
          )::geography
        ) / 1000
        AS distance_km

      FROM "Theatre"

      WHERE
        location IS NOT NULL

        AND ST_DWithin(
          location,

          ST_SetSRID(
            ST_MakePoint(
              ${longitude},
              ${latitude}
            ),
            4326
          )::geography,

          30000
        )

      ORDER BY distance_km ASC
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
    // 3. distance map
    // =========================

    const distanceMap =
      new Map(
        nearbyTheatres.map(
          (theatre) => [
            theatre.id,
            Number(
              theatre.distance_km
            ),
          ]
        )
      );

    // =========================
    // 4. fetch shows
    // =========================

    const shows =
      await prisma.show.findMany({
        where: {
          movie_id: movieId,

          theatre_id: {
            in: theatreIds,
          },

          start_time: {
            gte: new Date(),
          },

          show_status: "scheduled",
        },

        select: {
          id: true,

          theatre_id: true,

          screen_id: true,

          start_time: true,

          end_time: true,

          language: true,

          format: true,

          base_price: true,

          theatre: {
            select: {
              id: true,

              theatre_name: true,

              chain_name: true,

              chain_logo: true,

              address: true,

              city: true,

              state: true,

              latitude: true,

              longitude: true,

              theatreFacilities: {
                select: {
                  facility: {
                    select: {
                      id: true,

                      facility_name: true,

                      facility_logo: true,
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: [
          {
            theatre_id: "asc",
          },
          {
            start_time: "asc",
          },
        ],
      });

    // =========================
    // 5. attach distance
    // =========================

    return shows.map((show) => ({
      ...show,

      theatre: {
        ...show.theatre,

        distance_km:
          distanceMap.get(
            show.theatre.id
          ) || 0,
      },
    }));

  } catch (err) {

    console.error(
      "Error fetching nearby movie shows:",
      err
    );

    throw new Error(
      "Failed to fetch nearby movie shows"
    );
  }
}


//bookins logic 

async function getShowSeatLayout(
  showId
) {
  try {

    return await prisma.show.findUnique({
      where: {
        id: showId,
      },

      select: {
        id: true,

        base_price: true,

        screen: {
          select: {
            id: true,

            seat_layout: true,

            // =========================
            // all seats
            // =========================

            seats: {
              select: {
                id: true,

                seat_number: true,

                row_label: true,

                seat_type: true,

                is_active: true,

                price_multiplier: true,
              },
            },
          },
        },

        // =========================
        // unavailable seats
        // =========================

        showSeats: {
          where: {
            OR: [

              // =========================
              // permanently booked
              // =========================

              {
                status: "BOOKED",
              },

              // =========================
              // active locks only
              // =========================

              {
                status: "LOCKED",

                lock_until: {
                  gt: new Date(),
                },
              },
            ],
          },

          select: {
            status: true,

            lock_until: true,

            seat: {
              select: {
                id: true,

                seat_number: true,

                row_label: true,

                seat_type: true,
              },
            },
          },
        },
      },
    });

  } catch (err) {

    console.error(
      "Error fetching show seat layout:",
      err
    );

    throw new Error(
      "Failed to fetch show seat layout"
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
    getMovieShowsByCities,
    getNearbyMovieShows,
    getShowSeatLayout,
}