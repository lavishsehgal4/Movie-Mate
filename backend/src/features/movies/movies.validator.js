function validateGetMoviesQuery(query) {
  const temp = {};

  // 🔹 type
  if (query.type) {
    const allowedTypes = ["now_playing", "upcoming"];
    if (!allowedTypes.includes(query.type)) {
      return { isValid: false, error: "Invalid type" };
    }
    temp.type = query.type;
  }

  // 🔹 search
  if (query.search) {
    if (typeof query.search !== "string") {
      return { isValid: false, error: "Search must be a string" };
    }
    const normalized = query.search.trim().toLowerCase();
    if (normalized.length > 50) {
      return { isValid: false, error: "Search too long" };
    }
    temp.search = normalized;
  }

  // 🔹 language
  if (query.language) {
    if (typeof query.language !== "string") {
      return { isValid: false, error: "Language must be a string" };
    }
    temp.language = query.language.trim().toLowerCase();
  }

  // 🔹 sort
  const allowedSorts = [
    "popularity_desc",
    "release_date_desc",
    "rating_desc",
  ];

  if (query.sort) {
    if (!allowedSorts.includes(query.sort)) {
      return { isValid: false, error: "Invalid sort option" };
    }
    temp.sort = query.sort;
  } else {
    temp.sort = "popularity_desc";
  }

  // 🔹 page
  const page = Number(query.page);
  if (query.page !== undefined) {
    if (isNaN(page) || page < 1) {
      return { isValid: false, error: "Invalid page" };
    }
    temp.page = page;
  } else {
    temp.page = 1;
  }

  // 🔹 limit
  const limit = Number(query.limit);
  if (query.limit !== undefined) {
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return { isValid: false, error: "Limit must be between 1 and 50" };
    }
    temp.limit = limit;
  } else {
    temp.limit = 10;
  }

  // ✅ mutate original query (optional but useful)
  Object.assign(query, temp);

  return { isValid: true };
}

module.exports = {
  validateGetMoviesQuery,
};