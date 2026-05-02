const Ticket = require("../models/Ticket.model");
const Message = require("../models/Message.model");
const User = require("../models/User.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const { categorizeTicket } = require("../services/ai.service");
const { assignFreeAgent } = require("../services/assignment.service");
const { getIO } = require("../config/socket");

const generateTicketNumber = async (tenantId) => {
  const count = await Ticket.countDocuments({ tenantId });
  return `TKT-${String(count + 1).padStart(5, "0")}`;
};

const getAllTickets = asyncHandler(async (req, res) => {
  const filter = { tenantId: req.tenantId };
  if (req.user.role === "customer") filter.customerId = req.user.id;
  if (req.query.assignedAgentId) {
    const raw = req.query.assignedAgentId;
    const agentId = raw === "me" ? req.user.id : raw;
    if (req.user.role === "agent" && String(agentId) !== String(req.user.id)) {
      return res.status(403).json(ApiResponse.error("Forbidden"));
    }
    filter.assignedAgentId = agentId;
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  let query = Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  if (filter.assignedAgentId) {
    query = query.populate("customerId", "name email");
  }

  const tickets = await query;
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

  try {
    const assignedAgent = await assignFreeAgent(req.tenantId);

    if (assignedAgent) {
      ticket.assignedAgentId = assignedAgent._id;
      ticket.status = "in_progress";
      await ticket.save();

      let customerName = "Customer";
      try {
        const customerDoc = await User.findById(req.user.id).select("name");
        if (customerDoc?.name) customerName = customerDoc.name;
      } catch (_n) {
        /* ignore */
      }

      try {
        getIO()
          .to(`agent:${String(assignedAgent._id)}`)
          .emit("agent:notification", {
            type: "ticket_assigned",
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            customerName,
            message: `New ticket assigned: ${ticket.title}`,
          });
      } catch (_emitErr) {
        /* socket emit must not break flow */
      }
    }
  } catch (assignError) {
    console.error("Auto-assignment failed:", assignError.message);
  }

  return res.status(201).json(ApiResponse.success("Ticket created", { ticket }));
});

const getTicket = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id, tenantId: req.tenantId };
  if (req.user.role === "customer") filter.customerId = req.user.id;
  const ticket = await Ticket.findOne(filter)
    .populate("assignedAgentId", "name email")
    .populate("customerId", "name email");
  if (!ticket) return res.status(404).json(ApiResponse.error("Ticket not found"));
  return res.status(200).json(ApiResponse.success("Ticket retrieved", { ticket }));
});

const changeTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenantId }, { status: req.body.status }, { new: true });
  if (!ticket) return res.status(404).json(ApiResponse.error("Ticket not found"));
  return res.status(200).json(ApiResponse.success("Ticket status updated", { ticket }));
});

const getTicketMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ ticketId: req.params.id, tenantId: req.tenantId })
    .sort({ createdAt: 1 })
    .populate("senderId", "name role");
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

  try {
    const populatedMessage = await Message.findById(message._id).populate("senderId", "name role");

    try {
      getIO().to(`ticket:${req.params.id}`).emit("ticket:message:new", {
        message: populatedMessage,
      });
    } catch (_e1) {
      /* ignore */
    }

    if (req.user.role === "agent") {
      try {
        getIO().to(`ticket:${req.params.id}`).emit("ticket:agent:replied", {
          ticketId: req.params.id,
          agentName: populatedMessage.senderId?.name || "Agent",
        });
      } catch (_e2) {
        /* ignore */
      }
    }

    if (req.user.role === "customer") {
      try {
        const ticketDoc = await Ticket.findById(req.params.id);
        if (ticketDoc?.assignedAgentId) {
          getIO()
            .to(`agent:${String(ticketDoc.assignedAgentId)}`)
            .emit("agent:notification", {
              type: "customer_replied",
              ticketId: req.params.id,
              ticketNumber: ticketDoc.ticketNumber,
              message: `Customer replied on ticket ${ticketDoc.ticketNumber}`,
            });
        }
      } catch (_e3) {
        /* ignore */
      }
    }
  } catch (socketError) {
    console.error("Socket emit failed:", socketError.message);
  }

  return res.status(201).json(ApiResponse.success("Message sent", { message }));
});

module.exports = { getAllTickets, createTicket, getTicket, changeTicketStatus, getTicketMessages, addTicketMessage };
