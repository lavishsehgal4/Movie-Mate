// =========================
// HELPERS
// =========================

function normalizeNumber(value) {

  const num = Number(value);

  if (isNaN(num) || num <= 0) {
    return null;
  }

  return num;
}

function normalizeString(value) {

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeDate(value) {

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

// =========================
// MAIN VALIDATOR
// =========================

function validateCreateShows(data) {

  const temp = {};

  // =========================
  // movie_id
  // =========================

  const movieId = normalizeNumber(
    data.movie_id
  );

  if (!movieId) {
    return {
      isValid: false,
      error: "Valid movie_id is required",
    };
  }

  temp.movie_id = movieId;

  // =========================
  // theatre_id
  // =========================

  const theatreId = normalizeNumber(
    data.theatre_id
  );

  if (!theatreId) {
    return {
      isValid: false,
      error: "Valid theatre_id is required",
    };
  }

  temp.theatre_id = theatreId;

  // =========================
  // screen_id
  // =========================

  const screenId = normalizeNumber(
    data.screen_id
  );

  if (!screenId) {
    return {
      isValid: false,
      error: "Valid screen_id is required",
    };
  }

  temp.screen_id = screenId;

  // =========================
  // shows array
  // =========================

  if (
    !Array.isArray(data.shows) ||
    data.shows.length === 0
  ) {
    return {
      isValid: false,
      error: "shows must be non-empty array",
    };
  }

  // =========================
  // future date limit
  // =========================

  const now = new Date();

  const maxAllowedDate = new Date();

  maxAllowedDate.setDate(
    maxAllowedDate.getDate() + 2
  );

  // =========================
  // normalize shows
  // =========================

  const normalizedShows = [];

  const timingSet = new Set();

  for (const show of data.shows) {

    // start_time
    const startTime = normalizeDate(
      show.start_time
    );

    if (!startTime) {
      return {
        isValid: false,
        error: "Invalid start_time",
      };
    }

    // end_time
    const endTime = normalizeDate(
      show.end_time
    );

    if (!endTime) {
      return {
        isValid: false,
        error: "Invalid end_time",
      };
    }

    // start < end
    if (startTime >= endTime) {
      return {
        isValid: false,
        error: "start_time must be before end_time",
      };
    }

    // future limit
    if (startTime > maxAllowedDate) {
      return {
        isValid: false,
        error:
          "Shows can only be created for today and next 2 days",
      };
    }

    // prevent past shows
    if (endTime < now) {
      return {
        isValid: false,
        error:
          "Cannot create already finished shows",
      };
    }

    // language
    const language = normalizeString(
      show.language
    );

    if (!language) {
      return {
        isValid: false,
        error: "language is required",
      };
    }

    // format
    const format = normalizeString(
      show.format
    );

    if (!format) {
      return {
        isValid: false,
        error: "format is required",
      };
    }

    // base_price
    const basePrice = normalizeNumber(
      show.base_price
    );

    if (!basePrice) {
      return {
        isValid: false,
        error: "Valid base_price is required",
      };
    }

    // duplicate timings in payload
    const timingKey =
      `${startTime.toISOString()}_${endTime.toISOString()}`;

    if (timingSet.has(timingKey)) {
      return {
        isValid: false,
        error:
          "Duplicate show timings in payload",
      };
    }

    timingSet.add(timingKey);

    // city
    const city = normalizeString(
        data.city
    ).toLowerCase();;

    if (!city) {
        return {
        isValid: false,
        error: "city is required",
        };
    }

    normalizedShows.push({
      movie_id: movieId,

      theatre_id: theatreId,

      screen_id: screenId,

      start_time: startTime,

      end_time: endTime,

      language,

      format,

      city,

      base_price: basePrice,
    });
  }

  temp.normalizedShows = normalizedShows;

  // =========================
  // apply mutation
  // =========================

  Object.assign(data, temp);

  return {
    isValid: true,
  };
}

function validateGetScreenShows(data) {

  const temp = {};

  // =========================
  // screen_id
  // =========================

  const screenId = normalizeNumber(
    data.screen_id
  );

  if (!screenId) {
    return {
      isValid: false,
      error: "Valid screen_id is required",
    };
  }

  temp.screen_id = screenId;

  // =========================
  // date
  // =========================

  const inputDate = normalizeDate(
    data.date
  );

  if (!inputDate) {
    return {
      isValid: false,
      error: "Valid date is required",
    };
  }

  // =========================
  // start of day
  // =========================

  const startOfDay = new Date(inputDate);

  startOfDay.setHours(0, 0, 0, 0);

  // =========================
  // next day start
  // =========================

  const endOfDay = new Date(startOfDay);

  endOfDay.setDate(
    endOfDay.getDate() + 1
  );

  temp.startOfDay = startOfDay;

  temp.endOfDay = endOfDay;

  // =========================
  // apply mutation
  // =========================

  Object.assign(data, temp);

  return {
    isValid: true,
  };
}

function validateGetMoviesByCities(data) {

  const temp = {};

  // =========================
  // cities
  // =========================

  if (
    !Array.isArray(data.cities) ||
    data.cities.length === 0
  ) {
    return {
      isValid: false,
      error: "cities must be non-empty array",
    };
  }

  const normalizedCities = [];

  const citySet = new Set();

  for (const city of data.cities) {

    const normalizedCity =
      normalizeString(city);

    if (!normalizedCity) {
      return {
        isValid: false,
        error: "Valid city is required",
      };
    }

    const lowerCity =
      normalizedCity.toLowerCase();

    if (citySet.has(lowerCity)) {
      continue;
    }

    citySet.add(lowerCity);

    normalizedCities.push(
      lowerCity
    );
  }

  temp.cities = normalizedCities;

  // =========================
  // apply mutation
  // =========================

  Object.assign(data, temp);

  return {
    isValid: true,
  };
}

function validateGetNearbyMovies(data) {

  const temp = {};

  // =========================
  // latitude
  // =========================

  const latitude =
    normalizeNumber(data.latitude);

  if (latitude === null) {
    return {
      isValid: false,
      error: "Valid latitude is required",
    };
  }

  // =========================
  // longitude
  // =========================

  const longitude =
    normalizeNumber(data.longitude);

  if (longitude === null) {
    return {
      isValid: false,
      error: "Valid longitude is required",
    };
  }

  // =========================
  // distance
  // =========================

  const distance =
    normalizeNumber(data.distance);

  if (distance === null) {
    return {
      isValid: false,
      error: "Valid distance is required",
    };
  }

  temp.latitude = latitude;

  temp.longitude = longitude;

  temp.distance = distance;

  // =========================
  // apply mutation
  // =========================

  Object.assign(data, temp);

  return {
    isValid: true,
  };
}

module.exports = {
  validateCreateShows,
  validateGetScreenShows,
  validateGetMoviesByCities,
  validateGetNearbyMovies,
};