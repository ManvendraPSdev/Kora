const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

function createApp() {
  const app = express();
  const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        // Allow server-to-server calls and same-origin requests without Origin header.
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.options("*", cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
    })
  );

  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
  app.use("/api/v1", routes);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
