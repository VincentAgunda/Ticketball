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
  "https://my-ticket-app-backend.onrender.com",
  normalize(process.env.FRONTEND_URL),
].filter(Boolean);

console.log("✅ Allowed Origins:", allowedOrigins);

const corsOptions = {
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
};

app.use(cors(corsOptions));

// ✅ Fix: Use "/*" instead of "*" to prevent PathError in Express 5+
app.options("/*", cors(corsOptions));

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

// Health check route
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
  console.error("Unhandled error:", error.message || error);
  res.status(500).json({
    success: false,
    error: error.message || "Internal server error",
  });
});

// Catch-all for undefined routes
app.use(/.*/, (req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

/* -------------------------------------------------------------------------- */
/* 🚀 START SERVER                                                            */
/* -------------------------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(", ")}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
