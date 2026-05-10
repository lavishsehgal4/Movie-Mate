const {
  getUserRoleForTheatre,
} = require("../features/theatre-memberships/theatreMembership.repository");

async function attachTheatreRole(req, res, next) {
  try {

    const userId = req.user?.userId;

    const theatreId = Number(
     req.body?.theatre_id || req.query?.theatre_id
    );

    if (!userId || !theatreId) {
      return res.status(400).json({
        success: false,
        message: "userId or theatre_id missing",
      });
    }

    const record = await getUserRoleForTheatre(
      userId,
      theatreId
    );

    if (!record) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // attach role to request
    req.theatreRole = record.role;

    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to verify theatre access",
    });
  }
}

function allowRoles(...allowedRoles) {

  return function (req, res, next) {

    const role = req.theatreRole;

    if (!role) {
      return res.status(403).json({
        success: false,
        message: "Role not found",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
}

module.exports = {
  attachTheatreRole,
  allowRoles
};