const express = require('express');
const router = express.Router();
const { sendSMS, sendTicketSMS, markSmsSent } = require('../controllers/smsController');
const { authenticateFirebase } = require('../middleware/auth');

router.post('/send', authenticateFirebase, sendSMS);
router.post('/send-ticket', authenticateFirebase, sendTicketSMS);
router.post('/mark-sent', authenticateFirebase, markSmsSent);

module.exports = router;