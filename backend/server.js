require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mpesaRoutes = require("./routes/mpesa");
const smsRoutes = require("./routes/sms");

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------------------------------------------------------------- */
/* 🌍 CORS CONFIGURATION (Supports Render + Local Development)                */
/* -------------------------------------------------------------------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://ticketmasters.vercel.app", // ✅ Production frontend
  process.env.FRONTEND_URL, // ✅ Optional env fallback
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from allowed origins or tools like Postman (no origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle OPTIONS preflight requests globally (important for CORS)
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

// ✅ Health check route
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
// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Catch-all for unknown routes
app.use(/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

/* -------------------------------------------------------------------------- */
/* 🚀 START SERVER                                                            */
/* -------------------------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(", ")}`);
  console.log(`🌎 Environment: ${process.env.NODE_ENV || "development"}`);
});
