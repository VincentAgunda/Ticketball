const express = require('express');
const router = express.Router();
const { sendSMS, sendTicketSMS, markSmsSent } = require('../controllers/smsController');
// ⚠️ Removed authentication middleware for send-ticket
const { authenticateFirebase } = require('../middleware/auth');

router.post('/send', authenticateFirebase, sendSMS);
// ✅ Allow both authenticated and non-authenticated users
router.post('/send-ticket', sendTicketSMS);
router.post('/mark-sent', authenticateFirebase, markSmsSent);

module.exports = router;