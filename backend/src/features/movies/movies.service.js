const { validateGetMoviesQuery } = require("./movies.validator");
const { getMovies } = require("./movies.repository");

async function fetchMovies(query) {
  // 🔹 1. validate
  const validation = validateGetMoviesQuery(query);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 🔹 2. call repo (query is already normalized by validator)
  const movies = await getMovies(query);

  // 🔹 3. return (no heavy transformation needed)
  return movies;
}

module.exports = {
  fetchMovies,
};