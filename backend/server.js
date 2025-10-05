require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mpesaRoutes = require("./routes/mpesa");
const smsRoutes = require("./routes/sms");

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------------------------------------------------------------- */
/* 🌍 CORS CONFIGURATION                                                      */
/* -------------------------------------------------------------------------- */
const normalize = (url) => url?.trim().replace(/\/$/, ""); // remove trailing slash

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://ticketmasters.vercel.app",
  normalize(process.env.FRONTEND_URL),
].filter(Boolean);

console.log("✅ Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? normalize(origin) : origin;
      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked request from: ${origin}`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle OPTIONS preflight requests globally
app.options("*", cors());

/* -------------------------------------------------------------------------- */
/* ⚙️ MIDDLEWARES                                                             */
/* -------------------------------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------------------------------- */
/* 🚀 ROUTES                                                                  */
/* -------------------------------------------------------------------------- */
app.use("/api/mpesa", mpesaRoutes);
app.use("/api/sms", smsRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running ✅",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------------------------------------------------------------- */
/* 🧱 ERROR HANDLERS                                                          */
/* -------------------------------------------------------------------------- */
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.use(/.*/, (req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

/* -------------------------------------------------------------------------- */
/* 🚀 START SERVER                                                            */
/* -------------------------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
