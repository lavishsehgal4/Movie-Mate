const { prisma } = require("../../config/prisma");

async function upsertMovie(data) {
  return await prisma.movie.upsert({
    where: {
      tmdb_id: data.tmdb_id,
    },
    update: {
      title: data.title,
      original_title: data.original_title,
      overview: data.overview,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_date: data.release_date,
      runtime: data.runtime,
      popularity: data.popularity,
      adult: data.adult,
      certification: data.certification,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      original_language: data.original_language,
      genres: data.genres,
      cast: data.cast,
    },
    create: {
      tmdb_id: data.tmdb_id,
      title: data.title,
      original_title: data.original_title,
      overview: data.overview,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_date: data.release_date,
      runtime: data.runtime,
      popularity: data.popularity,
      adult: data.adult,
      certification: data.certification,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      original_language: data.original_language,
      genres: data.genres,
      cast: data.cast,
    },
  });
}


async function getMovies(filters) {
  try {
    const {
      type,        // now_playing | upcoming
      search,
      language,
      sort = "popularity_desc",
      page = 1,
      limit = 20,
    } = filters;

    const now = new Date();

    // 🔹 WHERE conditions
    const where = {
      AND: [],
    };

    // 👉 contract window
    where.AND.push({
      release_date: { lte: now },
    });

    where.AND.push({
      OR: [
        { contract_end: null },
        { contract_end: { gte: now } },
      ],
    });

    // 👉 type filter
    if (type === "upcoming") {
      where.AND = [
        {
          release_date: { gt: now },
        },
      ];
    }

    // 👉 search (prefix)
    if (search) {
      where.AND.push({
        search_title: {
          startsWith: search.toLowerCase(),
        },
      });
    }

    // 👉 language filter
    if (language) {
      where.AND.push({
        original_language: language,
      });
    }

    // 🔹 SORT
    let orderBy = {};

    if (sort === "popularity_desc") {
      orderBy = { popularity: "desc" };
    } else if (sort === "release_date_desc") {
      orderBy = { release_date: "desc" };
    } else if (sort === "rating_desc") {
      orderBy = { vote_average: "desc" };
    }

    // 🔹 PAGINATION
    const skip = (page - 1) * limit;

    // 🔹 QUERY
    const movies = await prisma.movie.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        original_title:true,
        adult:true,
        poster_path: true,
        release_date: true,
        popularity: true,
        original_language: true,
      },
    });

    return movies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Failed to fetch movies");
  }
}


module.exports = {
  upsertMovie,
  getMovies,
};