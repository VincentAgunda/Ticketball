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

    if (!ticket || !user) {
      return res.status(400).json({
        success: false,
        error: 'Ticket and user data are required'
      });
    }

    const phoneNumber = ticket.user_phone || user.phoneNumber;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber.substring(1) 
      : phoneNumber;

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

    const message = `⚽ FOOTBALL TICKET CONFIRMED ⚽

Match: ${matchName}
Date: ${matchDate}
Venue: ${venue}
Seat: ${ticket.seat_number}
Type: ${seatType}
Price: KES ${ticket.price}
Ticket ID: ${ticket.id?.slice(0, 8).toUpperCase() || 'N/A'}

View your ticket: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/tickets

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
    
    res.status(500).json({
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