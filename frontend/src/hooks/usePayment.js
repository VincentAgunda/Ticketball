import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserTickets } from './useFirebase';
import { mpesaService, smsService } from '../services/api';
import { formatPhoneNumber } from '../utils/helpers';

export const usePayment = () => {
  const { user } = useAuth();
  const { createTicket } = useUserTickets(user?.uid);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processPayment = async (paymentData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting payment process...', paymentData);

      // 1. Initiate M-Pesa payment
      const paymentResult = await mpesaService.initiatePayment({
        phoneNumber: formatPhoneNumber(paymentData.phoneNumber),
        amount: paymentData.amount,
        ticketData: paymentData.ticketData,
        reference: `TICKET-${Date.now()}`
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Payment initiation failed');
      }

      console.log('Payment initiated, checking status...');

      // 2. Poll for payment status
      let paymentStatus = null;
      let attempts = 0;
      const maxAttempts = 30; // 3 minutes max

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 6000)); // Wait 6 seconds
        
        const statusCheck = await mpesaService.checkPaymentStatus(
          paymentResult.checkoutRequestId
        );

        console.log('Payment status check:', statusCheck);

        if (statusCheck.status === 'Paid') {
          paymentStatus = statusCheck;
          break;
        } else if (statusCheck.status === 'Failed' || statusCheck.status === 'Cancelled') {
          throw new Error(`Payment ${statusCheck.status.toLowerCase()}`);
        }

        attempts++;
      }

      if (!paymentStatus) {
        throw new Error('Payment timeout - please try again');
      }

      // 3. Create ticket in Firebase
      const ticket = await createTicket({
        ...paymentData.ticketData,
        user_id: user.uid,
        user_email: user.email,
        user_phone: formatPhoneNumber(paymentData.phoneNumber),
        status: 'active',
        payment_reference: paymentResult.checkoutRequestId,
        payment_amount: paymentData.amount,
        sms_sent: false, // Track SMS status
        created_at: new Date().toISOString()
      });

      console.log('Ticket created:', ticket);

      // 4. Send SMS automatically after successful payment
      try {
        const smsResult = await smsService.sendTicketSMS(ticket, {
          id: user.uid,
          email: user.email,
          phoneNumber: formatPhoneNumber(paymentData.phoneNumber)
        });

        if (smsResult.success) {
          // Mark SMS as sent in the ticket
          await smsService.markSmsSent(ticket.id);
          console.log('SMS sent successfully after payment');
        } else {
          console.warn('SMS sending failed:', smsResult.message);
        }
      } catch (smsError) {
        console.warn('SMS sending failed, but payment was successful:', smsError);
        // Don't fail the payment if SMS fails
      }

      return {
        success: true,
        ticket,
        payment: paymentStatus
      };

    } catch (err) {
      console.error('Payment process error:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    processPayment,
    loading,
    error
  };
};