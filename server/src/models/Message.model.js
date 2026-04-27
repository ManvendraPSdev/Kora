const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", default: null },
    chatSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession", default: null },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    senderRole: { type: String, enum: ["customer", "agent", "admin", "ai"], required: true },
    content: { type: String, required: true },
    attachments: [{ url: String, filename: String }],
    isAiGenerated: { type: Boolean, default: false },
    aiConfidence: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
