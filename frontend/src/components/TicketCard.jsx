import React, { useState } from 'react';
import { Download, Sms, Warning } from '@mui/icons-material';
import TicketQR from './TicketQR';
import { smsService } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';

const TicketCard = ({ ticket, user }) => {
  const [smsStatus, setSmsStatus] = useState(null);
  const [sendingSms, setSendingSms] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const glassClass = "bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg rounded-xl";

  const handleSendSMS = async () => {
    if (!user?.phoneNumber) {
      setSmsStatus("User phone number not found.");
      return;
    }

    setSendingSms(true);
    setSmsStatus(null);

    try {
      const message = `Hi! Your ticket (${ticket.id.slice(0,8).toUpperCase()}) for ${ticket.match.home_team} vs ${ticket.match.away_team} on ${formatDate(ticket.match.match_date)} is confirmed.
Seat: ${ticket.seat_number}.
View your ticket online: http://localhost:5173/tickets/${ticket.id}`;

      const result = await smsService.sendSMS({
        phoneNumber: user.phoneNumber,
        message,
      });

      setSmsStatus(result.success ? "SMS sent successfully!" : "Failed to send SMS");
    } catch (error) {
      setSmsStatus("Error sending SMS");
    } finally {
      setSendingSms(false);
    }
  };

  const handleDownloadTicket = async () => {
    setDownloading(true);
    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `ticket-${ticket.id.slice(0,8)}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      setSmsStatus("Download failed: Could not generate ticket image");
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return 'bg-green-500 text-white';
      case 'used':
        return 'bg-blue-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={`${glassClass} overflow-hidden`}>
      <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-400 rounded-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-300 mb-1">Scan QR Code</p>
              <p className="text-xs text-gray-400">at stadium entrance</p>
            </div>
            <TicketQR ticket={ticket} size={140} />
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-300">Ticket ID</p>
              <p className="font-mono font-bold text-white text-sm">
                {ticket.id?.slice(0, 8).toUpperCase() || 'N/A'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {ticket.match.home_team} vs {ticket.match.away_team}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1) || 'Active'}
              </span>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                <CalendarToday className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-gray-300 text-xs">Date & Time</p>
                  <p className="text-white font-semibold">{formatDate(ticket.match.match_date)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                <LocationOn className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-gray-300 text-xs">Venue</p>
                  <p className="text-white font-semibold">{ticket.match.venue}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                <EventSeat className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-gray-300 text-xs">Seat Number</p>
                  <p className="text-white font-semibold">
                    {ticket.seat_number}
                    {ticket.seat_type && (
                      <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-1 rounded">
                        {ticket.seat_type}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                <ConfirmationNumber className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-gray-300 text-xs">Price</p>
                  <p className="text-white font-semibold">{formatCurrency(ticket.price)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-black/40 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-200 flex items-center">
                    <Sms className="h-4 w-4 mr-2 text-blue-400" />
                    <strong>SMS Notification:</strong> 
                    <span className="ml-2 text-yellow-400">
                      Click to send confirmation SMS
                    </span>
                  </p>
                  {smsStatus && (
                    <p className={`text-xs mt-1 ${
                      smsStatus.includes("success") ? "text-green-300" : "text-red-300"
                    }`}>
                      {smsStatus}
                    </p>
                  )}
                  {!user?.phoneNumber && (
                    <p className="text-xs text-red-300 mt-1">
                      No phone number found. SMS cannot be sent.
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSendSMS}
                  disabled={sendingSms || !user?.phoneNumber}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition text-sm"
                >
                  <Sms className="h-4 w-4" />
                  <span>{sendingSms ? "Sending..." : "Send SMS"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/20 bg-black/30 flex justify-between items-center">
        <div className="text-sm text-gray-300">
          <span>Purchased on {formatDate(ticket.created_at)}</span>
        </div>
        <button
          onClick={handleDownloadTicket}
          disabled={downloading}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50 transition"
        >
          <Download className="h-5 w-5" />
          <span>{downloading ? "Downloading..." : "Download Ticket"}</span>
        </button>
      </div>
    </div>
  );
};

export default TicketCard;