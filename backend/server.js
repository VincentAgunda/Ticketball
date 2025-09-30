require('dotenv').config();
const express = require('express');
const cors = require('cors');

const mpesaRoutes = require('./routes/mpesa');
const smsRoutes = require('./routes/sms');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow multiple origins (localhost for dev, Vercel for frontend, Render backend)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman) or whitelisted ones
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API Routes
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/sms', smsRoutes);

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ✅ Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ✅ Catch-all for unknown routes
app.use(/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
