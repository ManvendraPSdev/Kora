const ApiResponse = require("../utils/apiResponse");

function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || 500;
  return res
    .status(status)
    .json(ApiResponse.error(error.message || "Internal server error"));
}

module.exports = errorHandler;
