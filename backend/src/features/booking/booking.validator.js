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

function normalizeString(value) {

  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

// ------------------ validators ------------------

function validateCreateOrder(
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
        "seat_ids must be array",
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

function validateVerifyPayment(
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
        "seat_ids must be array",
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
  // razorpay ids
  // =========================

  const razorpayOrderId =
    normalizeString(
      data.razorpay_order_id
    );

  const razorpayPaymentId =
    normalizeString(
      data.razorpay_payment_id
    );

  const razorpaySignature =
    normalizeString(
      data.razorpay_signature
    );

  if (!razorpayOrderId) {
    return {
      isValid: false,
      error:
        "razorpay_order_id required",
    };
  }

  if (!razorpayPaymentId) {
    return {
      isValid: false,
      error:
        "razorpay_payment_id required",
    };
  }

  if (!razorpaySignature) {
    return {
      isValid: false,
      error:
        "razorpay_signature required",
    };
  }

  temp.razorpay_order_id =
    razorpayOrderId;

  temp.razorpay_payment_id =
    razorpayPaymentId;

  temp.razorpay_signature =
    razorpaySignature;

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

//real booking 

function validateConfirmBooking(
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
        "seat_ids must be array",
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


module.exports = {
  validateCreateOrder,
  validateVerifyPayment,
  validateConfirmBooking
};