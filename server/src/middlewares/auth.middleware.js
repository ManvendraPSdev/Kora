const ApiResponse = require("../utils/apiResponse");
const { verifyAccessToken } = require("../utils/generateToken");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return res.status(401).json(ApiResponse.error("Unauthorized"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json(ApiResponse.error("Invalid or expired token"));
  }
}

module.exports = authenticate;
