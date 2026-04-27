const Ticket = require("../models/Ticket.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const getOverview = asyncHandler(async (req, res) => {
  const total = await Ticket.countDocuments({ tenantId: req.tenantId });
  const resolved = await Ticket.countDocuments({ tenantId: req.tenantId, status: { $in: ["resolved", "closed"] } });
  const escalated = await Ticket.countDocuments({ tenantId: req.tenantId, status: "escalated" });
  return res.status(200).json(ApiResponse.success("Overview retrieved", { total, resolved, escalated }));
});

module.exports = { getOverview };
