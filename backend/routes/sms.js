const express = require('express');
const router = express.Router();
const { sendSMS } = require('../controllers/smsController');
const { authenticateFirebase } = require('../middleware/auth');

router.post('/send', authenticateFirebase, sendSMS);

module.exports = router;