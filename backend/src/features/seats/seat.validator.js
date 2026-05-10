// ------------------ helpers ------------------

function normalizeNumber(value) {
  const num = Number(value);

  if (isNaN(num) || num <= 0) {
    return null;
  }

  return num;
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

  // row_label
  const rowLabel = normalizeString(
    data.row_label
  );

  if (!rowLabel) {
    return {
      isValid: false,
      error: "row_label is required",
    };
  }

  temp.row_label = rowLabel;

  // seat_number
  const seatNumber = normalizeNumber(
    data.seat_number
  );

  if (!seatNumber) {
    return {
      isValid: false,
      error: "Valid seat_number is required",
    };
  }

  temp.seat_number = seatNumber;

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