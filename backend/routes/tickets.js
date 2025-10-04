const express = require('express');
const router = express.Router();
const { downloadTicketPDF } = require('../controllers/ticketDownloadController');

// ✅ Route: /api/download/:ticketId
router.get('/:ticketId', downloadTicketPDF);

module.exports = router;
