const{fetchMovieCounts}=require('./movie.sync.service');

async function getMovieCounts(req, res) {
  try {
    const data = await fetchMovieCounts();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  getMovieCounts,
};