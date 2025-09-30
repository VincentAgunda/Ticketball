import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import admin from "firebase-admin";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ================== FIREBASE ADMIN ==================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

// ================== HEALTH CHECK ==================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ================== MPESA ROUTES ==================
app.post("/api/mpesa/stk-push", async (req, res) => {
  try {
    const { phoneNumber, amount } = req.body;

    // Generate token
    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        auth: {
          username: process.env.MPESA_CONSUMER_KEY,
          password: process.env.MPESA_CONSUMER_SECRET,
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
    ).toString("base64");

    const stkPushResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "TicketBall",
        TransactionDesc: "Football Ticket Purchase",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(stkPushResponse.data);
  } catch (error) {
    console.error("Mpesa Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

app.post("/api/mpesa/callback", (req, res) => {
  console.log("Mpesa Callback:", JSON.stringify(req.body, null, 2));
  res.json({ message: "Callback received" });
});

// ================== SMS ROUTES ==================
app.post("/api/sms/send", async (req, res) => {
  try {
    const { to, message } = req.body;

    // Example for Africa’s Talking (replace with Twilio if needed)
    const smsResponse = await axios.post(
      "https://api.africastalking.com/version1/messaging",
      new URLSearchParams({
        username: "sandbox",
        to,
        message,
        from: process.env.SMS_SENDER_ID,
      }),
      {
        headers: {
          apiKey: process.env.SMS_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(smsResponse.data);
  } catch (error) {
    console.error("SMS Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send SMS" });
  }
});

app.post("/api/sms/send-ticket", async (req, res) => {
  const { ticket, user } = req.body;
  // Format your ticket SMS
  const message = `Hello ${user.name}, your ticket for ${ticket.match} is confirmed. Seat: ${ticket.seat}.`;
  try {
    const smsResponse = await axios.post(
      "https://api.africastalking.com/version1/messaging",
      new URLSearchParams({
        username: "sandbox",
        to: user.phone,
        message,
        from: process.env.SMS_SENDER_ID,
      }),
      {
        headers: {
          apiKey: process.env.SMS_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(smsResponse.data);
  } catch (error) {
    console.error("Ticket SMS Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send ticket SMS" });
  }
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
