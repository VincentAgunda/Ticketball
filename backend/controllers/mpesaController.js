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

    // ✅ Format phone (Safaricom requires 2547...)
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

    // ✅ Save payment request in Firestore
    await db.collection("payment_requests")
      .doc(response.data.CheckoutRequestID)
      .set({
        user_id: userId,
        phone_number: formattedPhone,
        amount,
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
    console.log(
      "🔔 M-Pesa Callback Received:",
      JSON.stringify(req.body, null, 2)
    );

    const callbackData = req.body.Body?.stkCallback;
    if (!callbackData) {
      console.error("❌ Invalid callback payload");
      return res.json({ ResultCode: 1, ResultDesc: "Invalid payload" });
    }

    const checkoutRequestId = callbackData.CheckoutRequestID;

    if (callbackData.ResultCode === 0) {
      // ✅ Payment Success
      const items = callbackData.CallbackMetadata?.Item || [];
      const amount = items.find((i) => i.Name === "Amount")?.Value;
      const mpesaReceipt = items.find(
        (i) => i.Name === "MpesaReceiptNumber"
      )?.Value;
      const phoneNumber = items.find((i) => i.Name === "PhoneNumber")?.Value;

      const paymentRequestRef = db
        .collection("payment_requests")
        .doc(checkoutRequestId);

      await paymentRequestRef.update({
        status: "completed",
        mpesa_receipt: mpesaReceipt,
        transaction_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const paymentRequestDoc = await paymentRequestRef.get();
      const paymentRequest = paymentRequestDoc.data();

      if (paymentRequest) {
        const ticketIds = paymentRequest.account_reference.split("_").slice(1);

        const batch = db.batch();
        for (const ticketId of ticketIds) {
          const ticketRef = db.collection("tickets").doc(ticketId);
          const ticketDoc = await ticketRef.get();

          if (ticketDoc.exists) {
            batch.update(ticketRef, {
              status: "active",
              mpesa_receipt: mpesaReceipt,
              payment_status: "completed",
              payment_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else {
            // ✅ Auto-create if missing
            batch.set(ticketRef, {
              status: "active",
              mpesa_receipt: mpesaReceipt,
              payment_status: "completed",
              phone_number: phoneNumber,
              amount,
              user_id: paymentRequest.user_id || "guest",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }

          const paymentRef = db.collection("payments").doc();
          batch.set(paymentRef, {
            ticket_id: ticketId,
            amount,
            mpesa_receipt: mpesaReceipt,
            phone_number: phoneNumber,
            status: "completed",
            transaction_date: new Date().toISOString(),
            user_id: paymentRequest.user_id,
            created_at: new Date().toISOString(),
          });
        }

        await batch.commit();
        await updateMatchSeats(ticketIds);
        await sendConfirmationSMS(phoneNumber, ticketIds, amount);
      }
    } else {
      // ❌ Payment Failed
      const errorMessage = callbackData.ResultDesc;

      const paymentRequestRef = db
        .collection("payment_requests")
        .doc(checkoutRequestId);

      await paymentRequestRef.update({
        status: "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      });
    }

    res.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).json({ ResultCode: 1, ResultDesc: "Error processing callback" });
  }
};

/**
 * Update available seats after successful payment
 */
async function updateMatchSeats(ticketIds) {
  try {
    if (!ticketIds.length) return;

    const firstTicketDoc = await db.collection("tickets").doc(ticketIds[0]).get();
    const firstTicket = firstTicketDoc.data();
    if (!firstTicket) return;

    const matchId = firstTicket.match_id;
    const seatsToReduce = ticketIds.length;

    const matchRef = db.collection("matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (matchDoc.exists) {
      const currentSeats = matchDoc.data().available_seats || 0;
      const newSeats = Math.max(0, currentSeats - seatsToReduce);

      await matchRef.update({
        available_seats: newSeats,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error updating match seats:", error);
  }
}

/**
 * Send confirmation SMS (mock/log)
 */
async function sendConfirmationSMS(phoneNumber, ticketIds, amount) {
  try {
    if (!ticketIds.length) return;

    const firstTicketDoc = await db.collection("tickets").doc(ticketIds[0]).get();
    const firstTicket = firstTicketDoc.data();
    if (!firstTicket) return;

    const matchDoc = await db.collection("matches").doc(firstTicket.match_id).get();
    const match = matchDoc.data();
    if (!match) return;

    const ticketsSnapshot = await db
      .collection("tickets")
      .where("__name__", "in", ticketIds)
      .get();

    const seatNumbers = ticketsSnapshot.docs
      .map((doc) => doc.data().seat_number || "N/A")
      .join(", ");

    const message = `Your booking for ${match.home_team} vs ${match.away_team} is confirmed!\n\nSeats: ${seatNumbers}\nAmount: KES ${amount}\nView tickets: ${process.env.FRONTEND_URL}/my-tickets\n\nThank you for choosing FootballTickets!`;

    console.log("📲 Confirmation SMS would be sent to:", phoneNumber);
    console.log("Message:", message);
  } catch (error) {
    console.error("Confirmation SMS error:", error);
  }
}

/**
 * Check payment status manually
 */
const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.query;

    const doc = await db.collection("payment_requests").doc(checkoutRequestId).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: "Payment request not found",
      });
    }

    const paymentRequest = doc.data();

    res.json({
      success: true,
      paymentConfirmed: paymentRequest.status === "completed",
      paymentRequest,
    });
  } catch (error) {
    console.error("Check payment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check payment status",
    });
  }
};

module.exports = {
  initiateSTKPush,
  handleCallback,
  checkPaymentStatus,
};
