const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    aiConfig: {
      systemPrompt: { type: String, default: "Be helpful, concise, and professional." },
      confidenceThreshold: { type: Number, default: 0.8 },
      model: { type: String, default: "gemini-2.5-flash-lite" },
      knowledgeBase: [{ type: String }],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tenantSchema.index({ isActive: 1 });

module.exports = mongoose.model("Tenant", tenantSchema);
