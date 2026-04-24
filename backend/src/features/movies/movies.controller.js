const { fetchMovieCounts, startMovieSync } = require('./movie.sync.service');

async function getMovieCounts(req, res) {
  console.log(`🎯 [CONTROLLER] ${new Date().toISOString()} getMovieCounts called`);
  try {
    const data = await fetchMovieCounts();

    console.log(`✅ [CONTROLLER] getMovieCounts success — now_playing: ${data.nowPlayingCount}, upcoming: ${data.upcomingCount}, total: ${data.total}`);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(`❌ [CONTROLLER] getMovieCounts error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function startSyncController(req, res) {
  console.log(`🎯 [CONTROLLER] ${new Date().toISOString()} startSyncController called`);
  try {
    const io = req.app.get("io"); // ✅ no circular dependency
    // 🔥 DO NOT await (runs in background)
    startMovieSync(io);

    console.log(`✅ [CONTROLLER] Sync triggered successfully`);
    return res.status(200).json({
      success: true,
      message: "Movie sync started",
    });
  } catch (err) {
    console.error(`❌ [CONTROLLER] startSyncController error: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  getMovieCounts,
  startSyncController
};