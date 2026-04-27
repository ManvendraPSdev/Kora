const ApiResponse = require("../utils/apiResponse");

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json(ApiResponse.error("Access denied"));
  }
  return next();
};

module.exports = authorize;
