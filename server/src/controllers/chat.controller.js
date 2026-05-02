const ChatSession = require("../models/ChatSession.model");
const Message = require("../models/Message.model");
const Ticket = require("../models/Ticket.model");
const Tenant = require("../models/Tenant.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const redis = require("../config/redis");
const { handleCustomerQuery } = require("../services/ai.service");

const startSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.create({ tenantId: req.tenantId, customerId: req.user.id, status: "active" });
  return res.status(201).json(ApiResponse.success("Chat session started", { session }));
});

const sendMessage = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({ _id: req.params.id, tenantId: req.tenantId, status: "active" });
  if (!session) return res.status(404).json(ApiResponse.error("Session not found"));

  const userMessage = await Message.create({
    tenantId: req.tenantId,
    chatSessionId: session._id,
    senderId: req.user.id,
    senderRole: "customer",
    content: req.body.content,
  });

  const history = await Message.find({ chatSessionId: session._id }).sort({ createdAt: 1 }).limit(20);
  const tenant = await Tenant.findById(req.tenantId);
  const aiResult = await handleCustomerQuery({ tenantId: req.tenantId, userMessage: req.body.content, history, aiConfig: tenant?.aiConfig });

  if (aiResult.shouldEscalate) {
    const ticket = await Ticket.create({
      tenantId: req.tenantId,
      ticketNumber: `TKT-${Date.now()}`,
      title: "Escalated chat",
      description: aiResult.reason || "Escalated from AI chat",
      status: "escalated",
      priority: "medium",
      category: "general",
      customerId: req.user.id,
    });
    session.status = "escalated";
    session.ticketId = ticket._id;
    await session.save();
    return res.status(200).json(ApiResponse.success("Escalated to human agent", { userMessage, ticketId: ticket._id }));
  }

  const aiMessage = await Message.create({
    tenantId: req.tenantId,
    chatSessionId: session._id,
    senderRole: "ai",
    content: aiResult.reply,
    isAiGenerated: true,
    aiConfidence: aiResult.confidence,
  });

  return res.status(200).json(ApiResponse.success("Message sent", { userMessage, aiMessage }));
});

const closeSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId, customerId: req.user.id },
    { status: "closed", closedAt: new Date() },
    { new: true }
  );
  if (!session) return res.status(404).json(ApiResponse.error("Session not found"));
  try {
    await redis.del(`chat:history:${req.params.id}`);
  } catch (_err) {}
  return res.status(200).json(ApiResponse.success("Session closed", { session }));
});

module.exports = { startSession, sendMessage, closeSession };
