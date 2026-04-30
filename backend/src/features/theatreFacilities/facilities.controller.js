const { addManyFacilities } = require("./facilities.service");

async function httpAddFacility(req, res) {
  try {
    const result = await addManyFacilities(req.body);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  httpAddFacility,
};