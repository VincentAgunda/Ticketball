const express = require('express');
const router = express.Router();
const { initiateSTKPush, handleCallback, checkPaymentStatus } = require('../controllers/mpesaController');
const { authenticateFirebase } = require('../middleware/auth');

router.post('/stk-push', authenticateFirebase, initiateSTKPush);
router.post('/callback', handleCallback);
router.get('/check-payment', authenticateFirebase, checkPaymentStatus);

module.exports = router;