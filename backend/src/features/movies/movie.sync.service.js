const axios = require("axios");

async function fetchMovieCounts() {
    const base = process.env.TMDB_BASE_URL;
    const key = process.env.TMDB_API_KEY;

    // now playing
  const nowRes = await axios.get(`${base}/movie/now_playing`, {
    params: { api_key: key, region: "IN" },
  });

  // upcoming
  const upcomingRes = await axios.get(`${base}/movie/upcoming`, {
    params: { api_key: key, region: "IN" },
  });

  return {
    nowPlayingCount: nowRes.data.total_results,
    upcomingCount: upcomingRes.data.total_results,
    total: nowRes.data.total_results + upcomingRes.data.total_results,
  };
}

module.exports={fetchMovieCounts};