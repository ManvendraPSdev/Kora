const { getModel } = require("../config/gemini");
const KnowledgeBase = require("../models/KnowledgeBase.model");

async function handleCustomerQuery({ tenantId, userMessage, history, aiConfig }) {
  const kbArticles = await KnowledgeBase.find({ tenantId, isActive: true });
  const kbContext = kbArticles.map((a) => `Q: ${a.title}\nA: ${a.content}`).join("\n---\n");

  const systemPrompt = `
You are a customer support AI for a business.
${aiConfig?.systemPrompt || "Be helpful, concise, and professional."}
Use this knowledge base:
${kbContext}
If not confident, output ONLY: {"escalate": true, "reason": "<reason>"}
Else output ONLY: {"escalate": false, "reply": "<reply>", "confidence": <0.0-1.0>}
`.trim();

  const model = getModel();
  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...(history || []).map((m) => ({
        role: m.senderRole === "customer" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ],
  });

  const result = await chat.sendMessage(userMessage);
  const raw = result.response.text();

  try {
    const parsed = JSON.parse(raw);
    const threshold = aiConfig?.confidenceThreshold ?? 0.8;
    if (parsed.escalate || Number(parsed.confidence || 0) < threshold) {
      return { shouldEscalate: true, reason: parsed.reason || "Low confidence" };
    }
    return { shouldEscalate: false, reply: parsed.reply, confidence: parsed.confidence };
  } catch (_error) {
    return { shouldEscalate: true, reason: "AI response parse error" };
  }
}

async function suggestReplies(ticketThread) {
  const model = getModel();
  const prompt = `
You are an expert support agent.
Thread:
${ticketThread}
Generate 3 professional replies.
Return ONLY JSON array.
`;
  const result = await model.generateContent(prompt);
  const raw = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(raw);
}

async function categorizeTicket(title, description) {
  const model = getModel();
  const prompt = `Classify this ticket into one category: billing, technical, account, feature-request, bug, general.
Title: "${title}"
Description: "${description}"
Return only one category.`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim().toLowerCase();
}

module.exports = { handleCustomerQuery, suggestReplies, categorizeTicket };
