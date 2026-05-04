const axios = require("axios");
const fs = require("fs");
const { upsertMovie } = require("./movies.repository");

// ------------------ UTILS ------------------

function logToFile(message) {
  fs.appendFileSync("movie-sync.log", message + "\n");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ------------------ AXIOS RETRY HELPER ------------------

async function fetchWithRetry(url, params, label, maxRetries = 2) {
  console.log(`🌐 [API] ${new Date().toISOString()} Fetching: ${label} | URL: ${url}`);

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const res = await axios.get(url, { params, timeout: 5000 });
      console.log(`✅ [API] Success: ${label} (status: ${res.status})`);
      return res;
    } catch (err) {
      console.error(`❌ [API ERROR] ${label} — attempt ${attempt}: ${err.message}`);
      if (attempt <= maxRetries) {
        console.log(`🔁 [API] Retrying request... attempt: ${attempt + 1}`);
        await delay(750);
      } else {
        console.error(`💀 [API] All ${maxRetries + 1} attempts failed for: ${label}`);
        throw err;
      }
    }
  }
}

// ------------------ PROGRESS ------------------

function updateProgress(progress, io) {
  progress.processed++;

  const percent = ((progress.processed / progress.total) * 100).toFixed(2);

  console.log(`📡 [SOCKET] ${new Date().toISOString()} Emitting progress: ${percent}% (${progress.processed}/${progress.total})`);

  io.emit("sync-progress", {
    percent,
    processed: progress.processed,
    total: progress.total,
  });
}

// ------------------ FETCH LIST ------------------

async function fetchMovies(status, pageNo) {
  const base = process.env.TMDB_BASE_URL;
  const key = process.env.TMDB_API_KEY;

  const res = await fetchWithRetry(
    `${base}/movie/${status}`,
    { api_key: key, region: "IN", page: pageNo },
    `${status} page:${pageNo}`
  );

  await delay(250);
  return res.data;
}

// ------------------ FORMAT BASIC ------------------

function formatData(movies) {
  return movies.map((movie) => ({
    tmdb_id: movie.id,
    title: movie.title,
    original_title: movie.original_title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: new Date(movie.release_date),
    popularity: movie.popularity,
    adult: movie.adult,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    original_language: movie.original_language,
    genres: movie.genre_ids,
  }));
}

// ------------------ FETCH DETAILS ------------------

async function fetchMovieDetails(movieId) {
  const base = process.env.TMDB_BASE_URL;
  const key = process.env.TMDB_API_KEY;

  const res = await fetchWithRetry(
    `${base}/movie/${movieId}`,
    { api_key: key },
    `movie-details:${movieId}`
  );

  await delay(250);
  return res.data;
}

// ------------------ FETCH CREDITS ------------------

async function fetchMovieCredits(movieId) {
  const base = process.env.TMDB_BASE_URL;
  const key = process.env.TMDB_API_KEY;

  const res = await fetchWithRetry(
    `${base}/movie/${movieId}/credits`,
    { api_key: key },
    `movie-credits:${movieId}`
  );

  await delay(250);
  return res.data;
}

// ------------------ MERGE ------------------

function mergeMovieData(basic, details, credits) {
  return {
    ...basic,
    runtime: details.runtime,
    genres: details.genres,
    cast: credits.cast?.slice(0, 5) || [],
  };
}

// ------------------ PROCESS MOVIE ------------------

async function processMovie(movie) {
  console.log(`🎬 [SERVICE] ${new Date().toISOString()} Processing movie: ${movie.tmdb_id} — "${movie.title}"`);
  try {
    const details = await fetchMovieDetails(movie.tmdb_id);
    const credits = await fetchMovieCredits(movie.tmdb_id);

    const fullData = mergeMovieData(movie, details, credits);

    await upsertMovie(fullData);

    console.log(`💾 [DB] ${new Date().toISOString()} DB write success: ${movie.tmdb_id} — "${movie.title}"`);
    logToFile(`${movie.tmdb_id} | SUCCESS`);
  } catch (err) {
    console.error(`❌ [SERVICE] Error processing movie ${movie.tmdb_id}: ${err.message}`);
    logToFile(`${movie.tmdb_id} | ERROR: ${err.message}`);
  }
}

// ------------------ SYNC TYPE ------------------

async function syncByType(type, progress, io) {
  console.log(`📦 [SERVICE] ${new Date().toISOString()} syncByType: ${type}`);
  let currPage = 1;

  let res = await fetchMovies(type, currPage);
  let totalPages = res.total_pages;

  let movies = formatData(res.results);

  for (const movie of movies) {
    await processMovie(movie);
    updateProgress(progress, io);
  }

  for (currPage = 2; currPage <= totalPages; currPage++) {
    res = await fetchMovies(type, currPage);
    movies = formatData(res.results);

    for (const movie of movies) {
      await processMovie(movie);
      updateProgress(progress, io);
    }
  }
}

// ------------------ FETCH COUNTS ------------------

async function fetchMovieCounts() {
  const base = process.env.TMDB_BASE_URL;
  const key = process.env.TMDB_API_KEY;

  console.log(`🌐 [API] ${new Date().toISOString()} Fetching movie counts from TMDB`);

  const nowRes = await fetchWithRetry(
    `${base}/movie/now_playing`,
    { api_key: key, region: "IN" },
    "counts:now_playing"
  );

  const upcomingRes = await fetchWithRetry(
    `${base}/movie/upcoming`,
    { api_key: key, region: "IN" },
    "counts:upcoming"
  );

  const result = {
    nowPlayingCount: nowRes.data.total_results,
    upcomingCount: upcomingRes.data.total_results,
    total: nowRes.data.total_results + upcomingRes.data.total_results,
  };

  console.log(`✅ [API] Movie counts — now_playing: ${result.nowPlayingCount}, upcoming: ${result.upcomingCount}, total: ${result.total}`);
  return result;
}

// ------------------ MAIN SYNC ------------------

async function startMovieSync(io) {
  console.log(`🚀 [SERVICE] ${new Date().toISOString()} startMovieSync started`);

  const counts = await fetchMovieCounts();

  const progress = {
    total: counts.total,
    processed: 0,
  };

  console.log(`📡 [SOCKET] ${new Date().toISOString()} Emitting sync-started — total: ${progress.total}`);
  io.emit("sync-started", {
    total: progress.total,
  });

  await syncByType("now_playing", progress, io);
  await syncByType("upcoming", progress, io);

  console.log(`📡 [SOCKET] ${new Date().toISOString()} Emitting sync-completed — total: ${progress.total}`);
  io.emit("sync-completed", {
    total: progress.total,
  });

  console.log(`🏁 [SERVICE] ${new Date().toISOString()} startMovieSync finished`);
}

// ------------------ EXPORTS ------------------

module.exports = {
  fetchMovieCounts,
  startMovieSync,
};