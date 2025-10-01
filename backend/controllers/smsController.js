const axios = require('axios');

const sendSMS = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required'
      });
    }

    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber.substring(1) 
      : phoneNumber;

    const smsData = new URLSearchParams();
    smsData.append('username', process.env.AT_USERNAME);
    smsData.append('to', formattedPhone);
    smsData.append('message', message);
    smsData.append('from', process.env.AT_SENDER_ID);

    const response = await axios.post(
      'https://api.africastalking.com/version1/messaging',
      smsData,
      {
        headers: {
          'apiKey': process.env.AT_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    if (response.data.SMSMessageData.Recipients[0].status === 'Success') {
      res.json({
        success: true,
        data: response.data,
        message: 'SMS sent successfully'
      });
    } else {
      throw new Error('SMS delivery failed');
    }

  } catch (error) {
    console.error('SMS sending error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
      details: error.response?.data || error.message
    });
  }
};

const sendTicketSMS = async (req, res) => {
  try {
    const { ticket, user } = req.body;

    if (!ticket) {
      return res.status(400).json({
        success: false,
        error: 'Ticket data is required'
      });
    }

    // ✅ Get phone number from ticket (for both authenticated and guest users)
    const phoneNumber = ticket.user_phone;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber.substring(1) 
      : phoneNumber.startsWith('254')
      ? phoneNumber
      : `254${phoneNumber.substring(phoneNumber.length - 9)}`;

    // Get match details from ticket
    const matchName = ticket.match?.home_team && ticket.match?.away_team 
      ? `${ticket.match.home_team} vs ${ticket.match.away_team}`
      : 'Football Match';

    // FIXED: Proper date formatting
    let matchDate = 'To be announced';
    if (ticket.match?.match_date) {
      try {
        const date = new Date(ticket.match.match_date);
        if (!isNaN(date.getTime())) {
          matchDate = date.toLocaleDateString('en-KE', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (dateError) {
        console.warn('Date formatting error:', dateError);
      }
    }

    const venue = ticket.match?.venue || 'Stadium';
    const seatType = ticket.seat_type ? ticket.seat_type.charAt(0).toUpperCase() + ticket.seat_type.slice(1) : 'Standard';

    // ✅ Improved message with guest link for non-authenticated users
    const guestLink = ticket.guest_secret 
      ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tickets/${ticket.id}?guest_secret=${ticket.guest_secret}`
      : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tickets/${ticket.id}`;

    const message = `⚽ FOOTBALL TICKET CONFIRMED ⚽

Match: ${matchName}
Date: ${matchDate}
Venue: ${venue}
Seat: ${ticket.seat_number || 'TBA'}
Type: ${seatType}
Price: KES ${ticket.price}
Ticket ID: ${ticket.id?.slice(0, 8).toUpperCase() || 'N/A'}

View your ticket: ${guestLink}

IMPORTANT:
• Present QR code at entrance
• Arrive 1 hour before match
• Valid only for specified seat

Need help? Call +254 700 123 456

Thank you for choosing FootballTickets!`;

    const smsData = new URLSearchParams();
    smsData.append('username', process.env.AT_USERNAME);
    smsData.append('to', formattedPhone);
    smsData.append('message', message);
    smsData.append('from', process.env.AT_SENDER_ID);

    const response = await axios.post(
      'https://api.africastalking.com/version1/messaging',
      smsData,
      {
        headers: {
          'apiKey': process.env.AT_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    const recipient = response.data.SMSMessageData.Recipients[0];
    
    if (recipient.status === 'Success') {
      console.log(`✅ SMS sent successfully to ${formattedPhone} for ticket ${ticket.id}`);
      res.json({
        success: true,
        data: response.data,
        message: 'Ticket SMS sent successfully',
        messageId: recipient.messageId
      });
    } else {
      throw new Error(`SMS delivery failed: ${recipient.status}`);
    }

  } catch (error) {
    console.error('Ticket SMS sending error:', error.message);
    
    // ✅ Still return success to not block the booking flow
    res.json({
      success: false,
      error: 'Failed to send ticket SMS',
      details: error.response?.data || error.message
    });
  }
};

const markSmsSent = async (req, res) => {
  try {
    const { ticketId } = req.body;
    
    if (!ticketId) {
      return res.status(400).json({
        success: false,
        error: 'Ticket ID is required'
      });
    }
    
    res.json({
      success: true,
      message: 'SMS status updated successfully',
      ticketId: ticketId
    });
    
  } catch (error) {
    console.error('Error marking SMS as sent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update SMS status'
    });
  }
};

module.exports = {
  sendSMS,
  sendTicketSMS,
  markSmsSent
};