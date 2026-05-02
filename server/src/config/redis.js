const Redis = require("ioredis");

const host = process.env.REDIS_HOST || "127.0.0.1";
const port = parseInt(process.env.REDIS_PORT || "6379", 10);
const password = process.env.REDIS_PASSWORD || undefined;

const redis = new Redis({
  host,
  port,
  ...(password ? { password } : {}),
});

redis.on("connect", () => {
  console.log("[redis] connected");
});

redis.on("error", (err) => {
  console.error("[redis] error:", err.message);
});

module.exports = redis;
