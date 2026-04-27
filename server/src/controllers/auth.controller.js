const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User.model");
const Tenant = require("../models/Tenant.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/generateToken");

const register = asyncHandler(async (req, res) => {
  const { businessName, slug, adminName, email, password } = req.body;
  const existingTenant = await Tenant.findOne({ slug });
  if (existingTenant) return res.status(409).json(ApiResponse.error("Tenant slug already taken"));

  const tenant = await Tenant.create({ name: businessName, slug });
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.create({ tenantId: tenant._id, name: adminName, email, passwordHash, role: "admin" });

  const accessToken = generateAccessToken({ id: admin._id, tenantId: tenant._id, role: admin.role });
  const refreshToken = generateRefreshToken({ id: admin._id });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  return res.status(201).json(ApiResponse.success("Registered successfully", { accessToken }));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !user.isActive) return res.status(401).json(ApiResponse.error("Invalid credentials"));
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json(ApiResponse.error("Invalid credentials"));
  const accessToken = generateAccessToken({ id: user._id, tenantId: user.tenantId, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  return res.status(200).json(ApiResponse.success("Login successful", { accessToken, user }));
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json(ApiResponse.error("No refresh token"));
  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json(ApiResponse.error("User not found"));
  const accessToken = generateAccessToken({ id: user._id, tenantId: user.tenantId, role: user.role });
  return res.status(200).json(ApiResponse.success("Token refreshed", { accessToken }));
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("refreshToken");
  return res.status(200).json(ApiResponse.success("Logged out"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+passwordHash");
  if (!user) return res.status(200).json(ApiResponse.success("If email exists, reset link sent"));
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
  await user.save();
  return res.status(200).json(ApiResponse.success("If email exists, reset link sent"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } }).select("+passwordHash");
  if (!user) return res.status(400).json(ApiResponse.error("Invalid or expired reset token"));
  user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return res.status(200).json(ApiResponse.success("Password reset successful"));
});

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword };
