const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["active", "escalated", "closed"], default: "active" },
    startedAt: { type: Date, default: Date.now },
    closedAt: Date,
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", default: null },
  },
  { timestamps: false }
);

chatSessionSchema.index({ tenantId: 1, status: 1 });
chatSessionSchema.index({ customerId: 1, status: 1 });
chatSessionSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);
