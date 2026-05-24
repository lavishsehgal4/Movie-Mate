const { prisma } = require("../../config/prisma");
const {updateSeatLocks,getActiveSeatLocks}= require('./showSeat.repository');
const {validateUpdateSeatLocks,validateGetActiveSeatLocks}= require('./showSeat.validator');

async function updateSeatLocksService(
  data,
  userId
) {

  // =========================
  // 1. validate input
  // =========================

  const validation =
    validateUpdateSeatLocks(
      data
    );

  if (!validation.isValid) {
    throw new Error(
      validation.error
    );
  }

  // =========================
  // 2. transaction
  // =========================

  await prisma.$transaction(
    async (tx) => {

      await updateSeatLocks(
        tx,
        {
          showId:
            data.show_id,

          seatIds:
            data.seat_ids,

          userId,

          action:
            data.action,
        }
      );
    }
  );

  // =========================
  // 3. return response
  // =========================

  return {
    success: true,

    action:
      data.action,

    seat_ids:
      data.seat_ids,
  };
}

async function getActiveSeatLocksService(
  data
) {

  // =========================
  // validate
  // =========================

  const validation =
    validateGetActiveSeatLocks(
      data
    );

  if (!validation.isValid) {
    throw new Error(
      validation.error
    );
  }

  // =========================
  // fetch locks
  // =========================

  const locks =
    await getActiveSeatLocks(
      data.user_id
    );

  // =========================
  // return response
  // =========================

  return {
    active_locks: locks,
  };
}

module.exports={
    updateSeatLocksService,
    getActiveSeatLocksService,
}