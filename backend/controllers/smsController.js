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

    res.json({
      success: true,
      data: response.data,
      message: 'SMS sent successfully'
    });

  } catch (error) {
    console.error('SMS sending error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
      details: error.response?.data || error.message
    });
  }
};

module.exports = {
  sendSMS
};