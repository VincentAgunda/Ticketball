const { db } = require('../config/firebase'); // Uses admin.firestore()
const { jsPDF } = require('jspdf');
const QRCode = require('qrcode');

// ✅ Utility to format currency
const formatCurrency = (amount) => `Ksh ${Number(amount || 0).toLocaleString()}`;

// ✅ Controller: Generate and download ticket as a PDF
exports.downloadTicketPDF = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const guestSecret = req.query.guest_secret;

    if (!ticketId) {
      return res.status(400).json({ success: false, error: 'Missing ticketId' });
    }

    // ✅ Use Firestore Admin SDK instead of client SDK
    const ticketSnap = await db.collection('tickets').doc(ticketId).get();

    if (!ticketSnap.exists) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const ticket = ticketSnap.data();

    // 🔐 Guest secret validation (for shared ticket links)
    if (ticket.guest_secret && guestSecret && guestSecret !== ticket.guest_secret) {
      return res.status(403).json({ success: false, error: 'Invalid or unauthorized guest link' });
    }

    // ✅ Create PDF document
    const docPDF = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // thermal printer format
    });

    // ✅ Ticket details
    const homeTeam = ticket.home_team || 'Unknown';
    const awayTeam = ticket.away_team || 'Unknown';
    const venue = ticket.venue || 'Unknown Venue';
    const date = ticket.match_date
      ? new Date(ticket.match_date.toDate ? ticket.match_date.toDate() : ticket.match_date).toLocaleString()
      : 'TBA';
    const seat = ticket.seat_number || ticket.category || 'Unassigned';
    const amount = formatCurrency(ticket.amount);

    // ✅ Header
    docPDF.setFontSize(14);
    docPDF.text('🎟 FOOTBALL TICKET', 10, 10);
    docPDF.setFontSize(10);
    docPDF.text('Thank you for choosing FootballTickets!', 10, 15);

    // ✅ Match info
    docPDF.setFontSize(12);
    docPDF.text(`${homeTeam} vs ${awayTeam}`, 10, 30);
    docPDF.setFontSize(10);
    docPDF.text(`Venue: ${venue}`, 10, 40);
    docPDF.text(`Date: ${date}`, 10, 47);
    docPDF.text(`Seat: ${seat}`, 10, 54);
    docPDF.text(`Amount: ${amount}`, 10, 61);

    // ✅ QR Code
    const qrText = `https://yourfrontend.com/my-tickets/${ticketId}`;
    const qrDataUrl = await QRCode.toDataURL(qrText);
    docPDF.addImage(qrDataUrl, 'PNG', 20, 70, 40, 40);

    // ✅ Ticket ID
    docPDF.setFontSize(9);
    docPDF.text(`Ticket ID: ${ticketId.slice(0, 10).toUpperCase()}`, 10, 120);

    // ✅ Footer
    docPDF.setFontSize(8);
    docPDF.text('FootballTickets © 2025', 20, 130);

    // ✅ Output as PDF
    const pdfBytes = docPDF.output();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ticket_${ticketId}.pdf`
    );
    res.send(Buffer.from(pdfBytes, 'binary'));
  } catch (error) {
    console.error('Error generating ticket PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate ticket PDF'
    });
  }
};
