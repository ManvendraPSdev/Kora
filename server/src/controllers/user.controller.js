const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ tenantId: req.tenantId }).select("-passwordHash -passwordResetToken -passwordResetExpires");
  return res.status(200).json(ApiResponse.success("Users retrieved", { users }));
});

const createUser = asyncHandler(async (req, res) => {
  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({ tenantId: req.tenantId, name: req.body.name, email: req.body.email, passwordHash, role: req.body.role });
  return res.status(201).json(ApiResponse.success("User created", { user }));
});

module.exports = { getAllUsers, createUser };
