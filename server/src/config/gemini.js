const { GoogleGenerativeAI } = require("@google/generative-ai");

function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 512,
    },
  });
}

module.exports = { getModel };
