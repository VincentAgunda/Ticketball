// backend/controllers/mpesaController.js
const axios = require("axios");
const { db } = require("../config/firebase");
const {
  generateAccessToken,
  generateTimestamp,
  generatePassword,
} = require("../utils/mpesaAuth");

/**
 * Initiate M-Pesa STK Push
 */
const initiateSTKPush = async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body;
    const userId = req.user?.uid || "guest";

    if (!phoneNumber || !amount || !accountReference) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: phoneNumber, amount, accountReference",
      });
    }

    // Format phone to 254...
    const formattedPhone = phoneNumber.startsWith("254")
      ? phoneNumber
      : `254${phoneNumber.substring(phoneNumber.length - 9)}`;

    const accessToken = await generateAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    const requestData = {
      BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_BUSINESS_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc || "Ticket Purchase",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Save payment request as number for amount
    await db
      .collection("payment_requests")
      .doc(response.data.CheckoutRequestID)
      .set({
        user_id: userId,
        phone_number: formattedPhone,
        amount: Number(amount),
        account_reference: accountReference,
        checkout_request_id: response.data.CheckoutRequestID,
        merchant_request_id: response.data.MerchantRequestID,
        status: "pending",
        created_at: new Date().toISOString(),
      });

    res.json({
      success: true,
      data: response.data,
      message: "Payment request sent successfully",
    });
  } catch (error) {
    console.error("STK Push error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.errorMessage || "Failed to initiate payment",
      details: error.response?.data || error.message,
    });
  }
};

/**
 * Handle M-Pesa Callback
 */
const handleCallback = async (req, res) => {
  try {
    console.log("🔔 M-Pesa Callback Received:", JSON.stringify(req.body, null, 2));

    const callbackData = req.body.Body?.stkCallback;
    if (!callbackData) {
      console.error("❌ Invalid callback payload");
      return res.json({ ResultCode: 1, ResultDesc: "Invalid payload" });
    }

    const checkoutRequestId = callbackData.CheckoutRequestID;

    if (callbackData.ResultCode === 0) {
      // Payment success
      const items = callbackData.CallbackMetadata?.Item || [];
      const amount = Number(items.find((i) => i.Name === "Amount")?.Value || 0);
      const mpesaReceipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
      const phoneNumber = items.find((i) => i.Name === "PhoneNumber")?.Value;

      // Update payment request doc
      const paymentRequestRef = db.collection("payment_requests").doc(checkoutRequestId);
      await paymentRequestRef.update({
        status: "completed",
        mpesa_receipt: mpesaReceipt,
        transaction_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const paymentRequestDoc = await paymentRequestRef.get();
      const paymentRequest = paymentRequestDoc.data();

      if (!paymentRequest) {
        console.warn("⚠️ Payment request missing for CheckoutRequestID:", checkoutRequestId);
        return res.json({ ResultCode: 0, ResultDesc: "Success" });
      }

      // account_reference format: matchId_ticket1_ticket2_...
      const parts = (paymentRequest.account_reference || "").split("_");
      const matchId = parts[0];
      const ticketIds = parts.slice(1).filter(Boolean);
      const userId = paymentRequest.user_id || "guest";

      // Load match data (if available) — used for enriching auto-created tickets & SMS
      let matchData = null;
      if (matchId) {
        const matchDoc = await db.collection("matches").doc(matchId).get();
        if (matchDoc.exists) matchData = matchDoc.data();
      }

      const batch = db.batch();

      // helper: generate seat number by type
      const generateSeatNumberForType = (type = "standard") => {
        const t = (type || "standard").toString().toUpperCase();
        const num = Math.floor(1 + Math.random() * 999); // random 1..999
        // If type is exactly 'standard' mimic FRONTEND naming STANDARD1 etc.
        if (t === "STANDARD" || t === "STD") return `${t}${num}`;
        if (t === "VIP") return `${t}${num}`;
        // fallback to A-###
        return `${t}-${num}`;
      };

      for (const ticketId of ticketIds) {
        const ticketRef = db.collection("tickets").doc(ticketId);
        const ticketDoc = await ticketRef.get();
        const exists = ticketDoc.exists;

        // determine seat_type and seat_number
        const existing = exists ? ticketDoc.data() : {};
        const seat_type = existing.seat_type || existing.type || "standard";
        const seat_number =
          existing.seat_number ||
          generateSeatNumberForType(seat_type) ||
          generateSeatNumberForType("standard");

        if (exists) {
          // Update existing ticket
          batch.update(ticketRef, {
            status: "active",
            mpesa_receipt: mpesaReceipt,
            payment_status: "completed",
            amount,
            seat_type,
            seat_number,
            updated_at: new Date().toISOString(),
          });
        } else {
          // Auto-create ticket doc for any missing tickets (guest or fallback)
          const autoTicket = {
            status: "active",
            mpesa_receipt: mpesaReceipt,
            payment_status: "completed",
            phone_number: phoneNumber,
            amount,
            user_id: userId,
            match_id: matchId || null,
            seat_type,
            seat_number,
            // copy match meta if available so front-end can show match info
            home_team: matchData?.home_team || null,
            away_team: matchData?.away_team || null,
            venue: matchData?.venue || null,
            match_date: matchData?.match_date || null,
            // generate guest_secret for later guest access
            guest_secret: existing.guest_secret || (userId === "guest" ? generateGuestSecret() : null),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          batch.set(ticketRef, autoTicket);
        }

        // create payment log
        const paymentRef = db.collection("payments").doc();
        batch.set(paymentRef, {
          ticket_id: ticketId,
          amount,
          mpesa_receipt: mpesaReceipt,
          phone_number: phoneNumber,
          status: "completed",
          transaction_date: new Date().toISOString(),
          user_id: userId,
          created_at: new Date().toISOString(),
        });
      }

      // Commit batch
      await batch.commit();

      // reduce match seats
      if (matchId && ticketIds.length > 0) {
        await updateMatchSeats(matchId, ticketIds.length);
      }

      // Send SMS (or log)
      await sendConfirmationSMS(phoneNumber, ticketIds, amount, matchId, userId);
    } else {
      // Payment failed
      const errorMessage = callbackData.ResultDesc;
      const paymentRequestRef = db.collection("payment_requests").doc(callbackData.CheckoutRequestID);
      await paymentRequestRef.update({
        status: "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      });
    }

    // Safely return to MPESA
    return res.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (err) {
    console.error("Callback error:", err);
    return res.status(500).json({ ResultCode: 1, ResultDesc: "Error processing callback" });
  }
};

/**
 * Helper: generate guest secret
 */
function generateGuestSecret() {
  // crypto random fallback
  try {
    if (typeof require === "function") {
      const { randomUUID } = require("crypto");
      return randomUUID();
    }
  } catch (e) {
    // ignore
  }
  return "gs_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Update available seats for a match
 */
async function updateMatchSeats(matchId, seatsToReduce) {
  try {
    if (!matchId) return;
    const matchRef = db.collection("matches").doc(matchId);
    const matchDoc = await matchRef.get();
    if (!matchDoc.exists) {
      console.warn(`⚠️ Match ${matchId} not found when updating seats.`);
      return;
    }
    const currentSeats = Number(matchDoc.data().available_seats || 0);
    const newSeats = Math.max(0, currentSeats - Number(seatsToReduce || 0));
    await matchRef.update({
      available_seats: newSeats,
      updated_at: new Date().toISOString(),
    });
    console.log(`🎟️ Updated available seats for match ${matchId} -> ${newSeats}`);
  } catch (err) {
    console.error("Error updating match seats:", err);
  }
}

/**
 * Compose and send confirmation SMS (server-side log by default)
 * - Includes per-ticket URL (with guest_secret if present)
 * - Includes seat + seat type and amount
 */
async function sendConfirmationSMS(phoneNumber, ticketIds, amount, matchId, userId) {
  try {
    if (!ticketIds || ticketIds.length === 0) return;

    // fetch match if available
    let match = null;
    if (matchId) {
      const mDoc = await db.collection("matches").doc(matchId).get();
      if (mDoc.exists) match = mDoc.data();
    }

    // fetch tickets
    // Firestore "in" supports up to 10 ids — safe for small batches
    const ticketsSnapshot = await db
      .collection("tickets")
      .where("__name__", "in", ticketIds)
      .get();

    // Build per-ticket entries
    const ticketEntries = ticketsSnapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        seat_number: data.seat_number || "Unassigned",
        seat_type: data.seat_type || data.type || "standard",
        guest_secret: data.guest_secret || null,
        amount: Number(data.amount || amount || 0),
      };
    });

    // Build message lines for tickets
    const ticketLines = ticketEntries
      .map((t) => {
        const url =
          `${process.env.FRONTEND_URL || "http://localhost:5173"}/tickets/${t.id}` +
          (t.guest_secret ? `?guest_secret=${t.guest_secret}` : "");
        return `• ${t.seat_type.toUpperCase()} - ${t.seat_number} - KES ${t.amount}\n  ${url}`;
      })
      .join("\n");

    const header = match
      ? `Your booking for ${match.home_team} vs ${match.away_team} is confirmed!\n`
      : `Your football ticket purchase is confirmed!\n`;

    const message = `${header}\n${ticketLines}\n\nThank you for choosing FootballTickets!`;

    // Log message (recommended: replace with real SMS send)
    console.log("📲 Confirmation SMS would be sent to:", phoneNumber);
    console.log("Message:", message);

    // If you want to actually send SMS from here, call your SMS provider or smsController endpoint.
    // Example (uncomment and set SMS_ENDPOINT env var): 
    // await axios.post(process.env.SMS_ENDPOINT || 'http://localhost:5000/api/sms/send-ticket', { phoneNumber, message });

  } catch (err) {
    console.error("Confirmation SMS error:", err);
  }
}

/**
 * Manual payment status check
 */
const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.query;
    if (!checkoutRequestId) {
      return res.status(400).json({ success: false, error: "checkoutRequestId required" });
    }

    const doc = await db.collection("payment_requests").doc(checkoutRequestId).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "Payment request not found" });
    }

    const paymentRequest = doc.data();
    return res.json({
      success: true,
      paymentConfirmed: paymentRequest.status === "completed",
      paymentRequest,
    });
  } catch (err) {
    console.error("Check payment error:", err);
    return res.status(500).json({ success: false, error: "Failed to check payment status" });
  }
};

module.exports = {
  initiateSTKPush,
  handleCallback,
  checkPaymentStatus,
};
