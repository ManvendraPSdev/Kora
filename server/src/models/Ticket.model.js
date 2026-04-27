const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    ticketNumber: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "escalated", "resolved", "closed"],
      default: "open",
    },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    category: { type: String, default: "general" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    tags: [{ type: String }],
    attachments: [{ url: String, filename: String }],
    aiHandled: { type: Boolean, default: false },
    escalatedAt: Date,
    resolvedAt: Date,
  },
  { timestamps: true }
);

ticketSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);
