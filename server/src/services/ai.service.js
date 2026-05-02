const { getModel } = require("../config/gemini");
const KnowledgeBase = require("../models/KnowledgeBase.model");
const Message = require("../models/Message.model");
const Tenant = require("../models/Tenant.model");
const redis = require("../config/redis");

async function getConversationHistory(sessionId) {
  const key = `chat:history:${sessionId}`;
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (_err) {
    // Redis unavailable — fall through to MongoDB
  }
  const messages = await Message.find({ chatSessionId: sessionId }).sort({ createdAt: 1 }).limit(20).lean();
  const serialized = messages.map((m) => ({
    senderRole: m.senderRole,
    content: m.content,
    chatSessionId: m.chatSessionId ? String(m.chatSessionId) : undefined,
  }));
  try {
    await redis.setex(key, 1800, JSON.stringify(serialized));
  } catch (_err) {
    // Redis unavailable — still return MongoDB result
  }
  return serialized;
}

async function appendMessageToHistory(sessionId, newMessage) {
  try {
    const key = `chat:history:${sessionId}`;
    const raw = await redis.get(key);
    if (!raw) return;
    let arr;
    try {
      arr = JSON.parse(raw);
    } catch (_parseErr) {
      return;
    }
    if (!Array.isArray(arr)) return;
    const last = arr[arr.length - 1];
    if (last && last.content === newMessage.content && last.senderRole === newMessage.senderRole) {
      return;
    }
    arr.push({
      senderRole: newMessage.senderRole,
      content: newMessage.content,
      chatSessionId: String(sessionId),
    });
    const trimmed = arr.slice(-20);
    await redis.setex(key, 1800, JSON.stringify(trimmed));
  } catch (_err) {
    // Redis unavailable — silent no-op
  }
}

async function getTenantAIConfig(tenantId) {
  const tid = String(tenantId);
  const key = `tenant:aiconfig:${tid}`;
  try {
    const cached = await redis.get(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_parseErr) {
        // Corrupt cache — refetch from MongoDB
      }
    }
  } catch (_err) {
    // Redis unavailable — fall through to MongoDB
  }
  const tenant = await Tenant.findById(tenantId).lean();
  const cfg = tenant?.aiConfig ? { ...tenant.aiConfig } : {};
  try {
    await redis.setex(key, 3600, JSON.stringify(cfg));
  } catch (_err) {
    // Redis unavailable — still return MongoDB result
  }
  return cfg;
}

async function getTenantKBContext(tenantId) {
  const tid = String(tenantId);
  const key = `tenant:kb:${tid}`;
  try {
    const cached = await redis.get(key);
    if (cached) return cached;
  } catch (_err) {
    // Redis unavailable — fall through to MongoDB
  }
  const kbArticles = await KnowledgeBase.find({ tenantId, isActive: true }).lean();
  const kbContext = kbArticles.map((a) => `Q: ${a.title}\nA: ${a.content}`).join("\n---\n");
  try {
    await redis.setex(key, 7200, kbContext);
  } catch (_err) {
    // Redis unavailable — still return MongoDB result
  }
  return kbContext;
}

async function handleCustomerQuery({ tenantId, userMessage, history, aiConfig }) {
  const sessionId = history?.[0]?.chatSessionId ? String(history[0].chatSessionId) : null;

  let conversationHistory = history || [];
  if (sessionId) {
    await appendMessageToHistory(sessionId, {
      senderRole: "customer",
      content: userMessage,
      chatSessionId: sessionId,
    });
    conversationHistory = await getConversationHistory(sessionId);
  }

  let aiConfigResolved = await getTenantAIConfig(tenantId);
  if (typeof aiConfigResolved === "object" && Object.keys(aiConfigResolved).length === 0) {
    aiConfigResolved = aiConfig || {};
  }
  const kbContext = await getTenantKBContext(tenantId);

  const systemPrompt = `
You are a customer support AI for a business.
${aiConfigResolved?.systemPrompt || "Be helpful, concise, and professional."}
Use this knowledge base:
${kbContext}
If not confident, output ONLY: {"escalate": true, "reason": "<reason>"}
Else output ONLY: {"escalate": false, "reply": "<reply>", "confidence": <0.0-1.0>}
`.trim();

  const model = getModel();
  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...(conversationHistory || []).map((m) => ({
        role: m.senderRole === "customer" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ],
  });

  const result = await chat.sendMessage(userMessage);
  const raw = result.response.text();

  try {
    const parsed = JSON.parse(raw);
    const threshold = aiConfigResolved?.confidenceThreshold ?? 0.8;
    if (parsed.escalate || Number(parsed.confidence || 0) < threshold) {
      return { shouldEscalate: true, reason: parsed.reason || "Low confidence" };
    }
    if (sessionId) {
      await appendMessageToHistory(sessionId, {
        senderRole: "ai",
        content: parsed.reply,
        chatSessionId: sessionId,
      });
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
