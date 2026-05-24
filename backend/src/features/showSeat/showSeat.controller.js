const {updateSeatLocksService,getActiveSeatLocksService}=require('./showSeat.service');


async function httpUpdateSeatLocks(
  req,
  res
) {
  try {

    const result =
      await updateSeatLocksService(
        req.body,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Failed to update seat locks",
    });
  }
}

async function httpGetActiveSeatLocks(
  req,
  res
) {
  try {

    const result =
      await getActiveSeatLocksService({
        user_id:
          req.user.userId,
      });

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch active seat locks",
    });
  }
}

module.exports={
    httpUpdateSeatLocks,
    httpGetActiveSeatLocks,
}