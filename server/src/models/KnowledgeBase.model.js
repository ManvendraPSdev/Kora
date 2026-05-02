const mongoose = require("mongoose");

const knowledgeBaseSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

knowledgeBaseSchema.index({ tenantId: 1, isActive: 1 });
knowledgeBaseSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model("KnowledgeBase", knowledgeBaseSchema);
