// ------------------ helpers ------------------

function normalizeNumber(value) {

  const num = Number(value);

  if (
    isNaN(num) ||
    num <= 0
  ) {
    return null;
  }

  return num;
}

function normalizeAction(value) {

  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toUpperCase();
}

// ------------------ main validators ------------------

function validateUpdateSeatLocks(
  data
) {

  const temp = {};

  // =========================
  // show_id
  // =========================

  const showId =
    normalizeNumber(
      data.show_id
    );

  if (!showId) {
    return {
      isValid: false,
      error:
        "Valid show_id is required",
    };
  }

  temp.show_id = showId;

  // =========================
  // seat_ids
  // =========================

  if (
    !Array.isArray(
      data.seat_ids
    )
  ) {
    return {
      isValid: false,
      error:
        "seat_ids must be an array",
    };
  }

  if (
    data.seat_ids.length === 0
  ) {
    return {
      isValid: false,
      error:
        "At least one seat required",
    };
  }

  // =========================
  // max seat limit
  // =========================

  if (
    data.seat_ids.length > 10
  ) {
    return {
      isValid: false,
      error:
        "Maximum 10 seats allowed",
    };
  }

  const normalizedSeatIds = [];

  const seatSet = new Set();

  for (const seatId of data.seat_ids) {

    const parsedSeatId =
      normalizeNumber(
        seatId
      );

    if (!parsedSeatId) {
      return {
        isValid: false,
        error:
          "Invalid seat id",
      };
    }

    // duplicate seat ids
    if (
      seatSet.has(
        parsedSeatId
      )
    ) {
      continue;
    }

    seatSet.add(
      parsedSeatId
    );

    normalizedSeatIds.push(
      parsedSeatId
    );
  }

  temp.seat_ids =
    normalizedSeatIds;

  // =========================
  // action
  // =========================

  const action =
    normalizeAction(
      data.action
    );

  const allowedActions = [
    "LOCK",
    "UNLOCK",
  ];

  if (
    !allowedActions.includes(
      action
    )
  ) {
    return {
      isValid: false,
      error:
        "Invalid action",
    };
  }

  temp.action = action;

  // =========================
  // apply mutation
  // =========================

  Object.assign(
    data,
    temp
  );

  return {
    isValid: true,
  };
}

function validateGetActiveSeatLocks(
  data
) {

  const temp = {};

  // =========================
  // user_id
  // =========================

  const userId =
    normalizeNumber(
      data.user_id
    );

  if (!userId) {
    return {
      isValid: false,
      error:
        "Valid user_id is required",
    };
  }

  temp.user_id = userId;

  // =========================
  // apply mutation
  // =========================

  Object.assign(
    data,
    temp
  );

  return {
    isValid: true,
  };
}
module.exports={
    validateUpdateSeatLocks,
    validateGetActiveSeatLocks
}