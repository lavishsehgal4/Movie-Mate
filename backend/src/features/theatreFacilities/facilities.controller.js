const { addManyFacilities,fetchAllFacilities } = require("./facilities.service");

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

async function httpGetAllFacilities(req, res) {
  try {
    const facilities = await fetchAllFacilities();

    return res.status(200).json({
      success: true,
      data: facilities,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to fetch facilities",
    });
  }
}


module.exports = {
  httpAddFacility,
  httpGetAllFacilities,
};