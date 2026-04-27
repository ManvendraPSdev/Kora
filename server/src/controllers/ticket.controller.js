const Ticket = require("../models/Ticket.model");
const Message = require("../models/Message.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const { categorizeTicket } = require("../services/ai.service");

const generateTicketNumber = async (tenantId) => {
  const count = await Ticket.countDocuments({ tenantId });
  return `TKT-${String(count + 1).padStart(5, "0")}`;
};

const getAllTickets = asyncHandler(async (req, res) => {
  const filter = { tenantId: req.tenantId };
  if (req.user.role === "customer") filter.customerId = req.user.id;
  const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(ApiResponse.success("Tickets retrieved", { tickets }));
});

const createTicket = asyncHandler(async (req, res) => {
  const { title, description, priority = "medium" } = req.body;
  let category = "general";
  try {
    category = await categorizeTicket(title, description);
  } catch (_error) {}
  const ticket = await Ticket.create({
    tenantId: req.tenantId,
    ticketNumber: await generateTicketNumber(req.tenantId),
    title,
    description,
    priority,
    category,
    customerId: req.user.role === "customer" ? req.user.id : req.body.customerId,
  });
  return res.status(201).json(ApiResponse.success("Ticket created", { ticket }));
});

const getTicket = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id, tenantId: req.tenantId };
  if (req.user.role === "customer") filter.customerId = req.user.id;
  const ticket = await Ticket.findOne(filter);
  if (!ticket) return res.status(404).json(ApiResponse.error("Ticket not found"));
  return res.status(200).json(ApiResponse.success("Ticket retrieved", { ticket }));
});

const changeTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenantId }, { status: req.body.status }, { new: true });
  if (!ticket) return res.status(404).json(ApiResponse.error("Ticket not found"));
  return res.status(200).json(ApiResponse.success("Ticket status updated", { ticket }));
});

const getTicketMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ ticketId: req.params.id, tenantId: req.tenantId }).sort({ createdAt: 1 });
  return res.status(200).json(ApiResponse.success("Messages retrieved", { messages }));
});

const addTicketMessage = asyncHandler(async (req, res) => {
  const message = await Message.create({
    tenantId: req.tenantId,
    ticketId: req.params.id,
    senderId: req.user.id,
    senderRole: req.user.role,
    content: req.body.content,
    attachments: req.body.attachments || [],
  });
  return res.status(201).json(ApiResponse.success("Message sent", { message }));
});

module.exports = { getAllTickets, createTicket, getTicket, changeTicketStatus, getTicketMessages, addTicketMessage };
