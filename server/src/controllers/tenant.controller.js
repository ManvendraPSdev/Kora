const Tenant = require("../models/Tenant.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const getAllTenants = asyncHandler(async (_req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });
  return res.status(200).json(ApiResponse.success("Tenants retrieved", { tenants }));
});

module.exports = { getAllTenants };
