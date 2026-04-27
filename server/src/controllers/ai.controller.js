const Ticket = require("../models/Ticket.model");
const Message = require("../models/Message.model");
const ChatSession = require("../models/ChatSession.model");
const Tenant = require("../models/Tenant.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const { handleCustomerQuery, suggestReplies, categorizeTicket } = require("../services/ai.service");

const queryAI = asyncHandler(async (req, res) => {
  const { sessionId, message } = req.body;
  const session = await ChatSession.findOne({ _id: sessionId, tenantId: req.tenantId, customerId: req.user.id, status: "active" });
  if (!session) return res.status(404).json(ApiResponse.error("Active chat session not found"));
  const history = await Message.find({ chatSessionId: sessionId }).sort({ createdAt: 1 }).limit(20);
  const tenant = await Tenant.findById(req.tenantId);
  const result = await handleCustomerQuery({ tenantId: req.tenantId, userMessage: message, history, aiConfig: tenant?.aiConfig });
  return res.status(200).json(ApiResponse.success("AI response", { result }));
});

const getSuggestedReplies = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.ticketId, tenantId: req.tenantId });
  if (!ticket) return res.status(404).json(ApiResponse.error("Ticket not found"));
  const messages = await Message.find({ ticketId: ticket._id }).sort({ createdAt: 1 });
  const thread = messages.map((m) => `[${m.senderRole.toUpperCase()}]: ${m.content}`).join("\n");
  const suggestions = await suggestReplies(`Ticket: ${ticket.title}\nDescription: ${ticket.description}\n${thread}`);
  return res.status(200).json(ApiResponse.success("Suggestions generated", { suggestions }));
});

const categorize = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const category = await categorizeTicket(title, description);
  return res.status(200).json(ApiResponse.success("Category determined", { category }));
});

module.exports = { queryAI, getSuggestedReplies, categorize };
