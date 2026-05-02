const Tenant = require("../models/Tenant.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const redis = require("../config/redis");

const getAllTenants = asyncHandler(async (_req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });
  return res.status(200).json(ApiResponse.success("Tenants retrieved", { tenants }));
});

const updateAIConfig = asyncHandler(async (req, res) => {
  const { tenantId } = req.params;
  const tenant = await Tenant.findByIdAndUpdate(tenantId, { aiConfig: req.body.aiConfig }, { new: true });
  if (!tenant) return res.status(404).json(ApiResponse.error("Tenant not found"));
  try {
    await redis.del(`tenant:aiconfig:${tenantId}`);
  } catch (_err) {}
  return res.status(200).json(ApiResponse.success("AI config updated", { tenant }));
});

module.exports = { getAllTenants, updateAIConfig };
