const mongoose = require("mongoose");

async function connectDB() {
  const defaultLocalUri = "mongodb://127.0.0.1:27017/ai_support";
  const defaultDockerUri = "mongodb://mongo:27017/ai_support";

  const mongoUri =
    process.env.MONGO_URI ||
    (process.env.NODE_ENV === "production" ? defaultDockerUri : defaultLocalUri);

  await mongoose.connect(mongoUri);
  console.log("Connected to DB ✅");
}

module.exports = connectDB;
