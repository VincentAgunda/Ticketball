const axios = require('axios');
const { db } = require('../config/firebase');
const { generateAccessToken, generateTimestamp, generatePassword } = require('../utils/mpesaAuth');

const initiateSTKPush = async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body;
    const userId = req.user.uid;

    if (!phoneNumber || !amount || !accountReference) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phoneNumber, amount, accountReference'
      });
    }

    const formattedPhone = phoneNumber.startsWith('254') 
      ? phoneNumber 
      : `254${phoneNumber.substring(phoneNumber.length - 9)}`;

    const accessToken = await generateAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    const requestData = {
      BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_BUSINESS_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc || 'Ticket Purchase'
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    await db.collection('payment_requests').doc(response.data.CheckoutRequestID).set({
      user_id: userId,
      phone_number: formattedPhone,
      amount: amount,
      account_reference: accountReference,
      checkout_request_id: response.data.CheckoutRequestID,
      merchant_request_id: response.data.MerchantRequestID,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      data: response.data,
      message: 'Payment request sent successfully'
    });

  } catch (error) {
    console.error('STK Push error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.errorMessage || 'Failed to initiate payment',
      details: error.response?.data || error.message
    });
  }
};

const handleCallback = async (req, res) => {
  try {
    const callbackData = req.body;

    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

    if (callbackData.Body.stkCallback.ResultCode === 0) {
      const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata;
      const items = callbackMetadata.Item;
      
      const amount = items.find(item => item.Name === 'Amount')?.Value;
      const mpesaReceipt = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const phoneNumber = items.find(item => item.Name === 'PhoneNumber')?.Value;
      const transactionDate = items.find(item => item.Name === 'TransactionDate')?.Value;

      const checkoutRequestId = callbackData.Body.stkCallback.CheckoutRequestID;

      const paymentRequestRef = db.collection('payment_requests').doc(checkoutRequestId);
      await paymentRequestRef.update({
        status: 'completed',
        mpesa_receipt: mpesaReceipt,
        transaction_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const paymentRequestDoc = await paymentRequestRef.get();
      const paymentRequest = paymentRequestDoc.data();

      if (paymentRequest) {
        const ticketIds = paymentRequest.account_reference.split('_').slice(1);
        
        const batch = db.batch();
        for (const ticketId of ticketIds) {
          const ticketRef = db.collection('tickets').doc(ticketId);
          batch.update(ticketRef, {
            status: 'active',
            mpesa_receipt: mpesaReceipt,
            payment_status: 'completed',
            payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          const paymentRef = db.collection('payments').doc();
          batch.set(paymentRef, {
            ticket_id: ticketId,
            amount: amount,
            mpesa_receipt: mpesaReceipt,
            phone_number: phoneNumber,
            status: 'completed',
            transaction_date: new Date().toISOString(),
            user_id: paymentRequest.user_id,
            created_at: new Date().toISOString()
          });
        }

        await batch.commit();
        await updateMatchSeats(ticketIds);
        await sendConfirmationSMS(phoneNumber, ticketIds, amount);
      }
    } else {
      const checkoutRequestId = callbackData.Body.stkCallback.CheckoutRequestID;
      const errorMessage = callbackData.Body.stkCallback.ResultDesc;

      const paymentRequestRef = db.collection('payment_requests').doc(checkoutRequestId);
      await paymentRequestRef.update({
        status: 'failed',
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      });

      const paymentRequestDoc = await paymentRequestRef.get();
      const paymentRequest = paymentRequestDoc.data();

      if (paymentRequest) {
        const ticketIds = paymentRequest.account_reference.split('_').slice(1);
        
        const batch = db.batch();
        for (const ticketId of ticketIds) {
          const ticketRef = db.collection('tickets').doc(ticketId);
          batch.update(ticketRef, {
            status: 'payment_failed',
            updated_at: new Date().toISOString()
          });
        }
        await batch.commit();
      }
    }

    res.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });

  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Error processing callback'
    });
  }
};

async function updateMatchSeats(ticketIds) {
  try {
    if (ticketIds.length === 0) return;

    const firstTicketDoc = await db.collection('tickets').doc(ticketIds[0]).get();
    const firstTicket = firstTicketDoc.data();

    if (!firstTicket) return;

    const matchId = firstTicket.match_id;
    const seatsToReduce = ticketIds.length;

    const matchRef = db.collection('matches').doc(matchId);
    const matchDoc = await matchRef.get();
    
    if (matchDoc.exists) {
      const currentSeats = matchDoc.data().available_seats || 0;
      const newSeats = Math.max(0, currentSeats - seatsToReduce);
      
      await matchRef.update({
        available_seats: newSeats,
        updated_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating match seats:', error);
  }
}

async function sendConfirmationSMS(phoneNumber, ticketIds, amount) {
  try {
    if (ticketIds.length === 0) return;

    const firstTicketDoc = await db.collection('tickets').doc(ticketIds[0]).get();
    const firstTicket = firstTicketDoc.data();

    if (!firstTicket) return;

    const matchDoc = await db.collection('matches').doc(firstTicket.match_id).get();
    const match = matchDoc.data();

    if (!match) return;

    const ticketsSnapshot = await db.collection('tickets')
      .where('__name__', 'in', ticketIds)
      .get();

    const seatNumbers = ticketsSnapshot.docs.map(doc => doc.data().seat_number).join(', ');

    const message = `Your booking for ${match.home_team} vs ${match.away_team} is confirmed!\n\n` +
      `Seats: ${seatNumbers}\n` +
      `Amount: KES ${amount}\n` +
      `View your tickets: ${process.env.FRONTEND_URL}/my-tickets\n\n` +
      `Thank you for choosing FootballTickets!`;

    console.log('Confirmation SMS would be sent to:', phoneNumber);
    console.log('Message:', message);

  } catch (error) {
    console.error('Confirmation SMS error:', error);
  }
}

const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.query;

    const paymentRequestDoc = await db.collection('payment_requests').doc(checkoutRequestId).get();
    
    if (!paymentRequestDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Payment request not found'
      });
    }

    const paymentRequest = paymentRequestDoc.data();

    res.json({
      success: true,
      paymentConfirmed: paymentRequest.status === 'completed',
      paymentRequest
    });

  } catch (error) {
    console.error('Check payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check payment status'
    });
  }
};

module.exports = {
  initiateSTKPush,
  handleCallback,
  checkPaymentStatus
};