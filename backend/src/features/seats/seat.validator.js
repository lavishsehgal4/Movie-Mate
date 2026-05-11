// ------------------ helpers ------------------

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

// ------------------ main validator ------------------

function validateCreateSeats(data) {

  const temp = {};

  // =========================
  // screen_id
  // =========================

  const screenId = normalizeNumber(data.screen_id);

  if (!screenId) {
    return {
      isValid: false,
      error: "Valid screen_id is required",
    };
  }

  temp.screen_id = screenId;

  // =========================
  // seat_layout
  // =========================

  if (
    !data.seat_layout ||
    typeof data.seat_layout !== "object"
  ) {
    return {
      isValid: false,
      error: "seat_layout is required",
    };
  }

  temp.seat_layout = data.seat_layout;

  // =========================
  // rows
  // =========================

  const rows = data.seat_layout.rows;

  if (!Array.isArray(rows)) {
    return {
      isValid: false,
      error: "rows must be an array",
    };
  }

  // =========================
  // normalize seats
  // =========================

  const normalizedSeats = [];

  for (const row of rows) {

    // skip non-seat rows
    if (!row.hasSeats) {
      continue;
    }

    if (!Array.isArray(row.seats)) {
      return {
        isValid: false,
        error: "Row seats must be array",
      };
    }

    for (const seat of row.seats) {

      // skip empty positions
      if (seat.type === 0) {
        continue;
      }

      const seatNumber = normalizeNumber(
        seat.displayNumber
      );

      if (!seatNumber) {
        return {
          isValid: false,
          error: "Invalid seat number",
        };
      }

      if (!seat.seat_type) {
        return {
          isValid: false,
          error: "seat_type is required",
        };
      }

      normalizedSeats.push({
        row_label: row.rowName,
        seat_number: seatNumber,
        seat_type: seat.seat_type,
      });
    }
  }

  temp.normalizedSeats = normalizedSeats;

  // =========================
  // apply mutation
  // =========================

  Object.assign(data, temp);

  return { isValid: true };
}

function validateGetScreenSeatLayout(data) {

  const temp = {};

  const screenId = normalizeNumber(data.screen_id);

  if (!screenId) {
    return {
      isValid: false,
      error: "Valid screen_id is required",
    };
  }

  temp.screen_id = screenId;

  // apply mutation
  Object.assign(data, temp);

  return {
    isValid: true,
  };
}

function validateUpdateSeatStatus(data) {

  const temp = {};

  // screen_id
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

  // seats
  if (
    !Array.isArray(data.seats) ||
    data.seats.length === 0
  ) {
    return {
      isValid: false,
      error: "seats must be non-empty array",
    };
  }

  const normalizedSeats = [];

  for (const seat of data.seats) {

    const rowLabel = normalizeString(
      seat.row_label
    );

    if (!rowLabel) {
      return {
        isValid: false,
        error: "row_label is required",
      };
    }

    const seatNumber = normalizeNumber(
      seat.seat_number
    );

    if (!seatNumber) {
      return {
        isValid: false,
        error: "Valid seat_number is required",
      };
    }

    normalizedSeats.push({
      row_label: rowLabel,
      seat_number: seatNumber,
    });
  }

  temp.seats = normalizedSeats;

  // is_active
  if (typeof data.is_active !== "boolean") {
    return {
      isValid: false,
      error: "is_active must be boolean",
    };
  }

  temp.is_active = data.is_active;

  // apply mutation
  Object.assign(data, temp);

  return {
    isValid: true,
  };
}


module.exports = {
  validateCreateSeats,
  validateGetScreenSeatLayout,
  validateUpdateSeatStatus,
};