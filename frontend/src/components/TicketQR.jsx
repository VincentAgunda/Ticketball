import React from 'react'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import { 
  ConfirmationNumber,
  SportsSoccer,
  CalendarToday,
  LocationOn,
  EventSeat,
  Person,
  Download
} from '@mui/icons-material'
import { formatDate, formatCurrency, generateQRData } from '../utils/helpers'

const TicketQR = ({ 
  ticket, 
  showDetails = true,
  size = 128,
  onDownload 
}) => {
  if (!ticket) {
    return (
      <div className="text-center p-8 text-gray-200">
        <ConfirmationNumber className="h-16 w-16 mx-auto mb-4" />
        <p>No ticket data available</p>
      </div>
    )
  }

  const { 
    id, 
    seat_number, 
    price, 
    match,
    user_id 
  } = ticket

  const qrData = generateQRData(id, match?.id, seat_number)

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
      return
    }

    // Create a high-quality PNG of the entire ticket
    const ticketElement = document.querySelector(`[data-ticket-id="${id}"]`) || 
                         document.querySelector(`canvas[data-ticket-id="${id}"]`)?.closest('.bg-white\\/20')
    
    if (ticketElement) {
      // Use html2canvas for better quality ticket export
      import('html2canvas').then(html2canvas => {
        html2canvas.default(ticketElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null
        }).then(canvas => {
          const pngUrl = canvas.toDataURL('image/png')
          const downloadLink = document.createElement('a')
          downloadLink.href = pngUrl
          downloadLink.download = `ticket-${match?.home_team}-vs-${match?.away_team}-${seat_number}.png`
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
        })
      }).catch(err => {
        console.error('Error generating ticket image:', err)
        // Fallback to QR code only
        const canvas = document.querySelector(`canvas[data-ticket-id="${id}"]`) || document.querySelector('canvas')
        if (canvas) {
          const pngUrl = canvas.toDataURL('image/png')
          const downloadLink = document.createElement('a')
          downloadLink.href = pngUrl
          downloadLink.download = `qr-${id}.png`
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
        }
      })
    }
  }

  return (
    <div data-ticket-id={id} className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg rounded-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <SportsSoccer className="h-8 w-8 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">FootballTickets</h2>
        </div>
        <p className="text-gray-200">Digital Ticket</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <QRCode 
            value={qrData} 
            size={size}
            level="H"
            includeMargin
            className="border-4 border-white rounded-lg bg-white"
            data-ticket-id={id}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <SportsSoccer className="h-8 w-8 text-white/20" />
          </div>
        </div>
      </div>

      {/* Ticket ID */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-200">Ticket ID</p>
        <p className="font-mono font-semibold text-white">{id.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full bg-yellow-400 text-gray-900 py-2 rounded-lg font-semibold mb-6 hover:bg-yellow-300 transition-colors flex items-center justify-center space-x-2"
      >
        <Download />
        <span>Download Ticket</span>
      </button>

      {/* Ticket Details */}
      {showDetails && match && (
        <div className="border-t border-white/30 pt-6 space-y-3 text-gray-200">
          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <SportsSoccer className="h-4 w-4" />
              <span>Match:</span>
            </span>
            <span className="font-semibold text-white text-right">{match.home_team} vs {match.away_team}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <CalendarToday className="h-4 w-4" />
              <span>Date & Time:</span>
            </span>
            <span className="font-semibold text-white">{formatDate(match.match_date)}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <LocationOn className="h-4 w-4" />
              <span>Venue:</span>
            </span>
            <span className="font-semibold text-white">{match.venue}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <EventSeat className="h-4 w-4" />
              <span>Seat:</span>
            </span>
            <span className="font-semibold text-white">{seat_number}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <span>💰</span>
              <span>Price:</span>
            </span>
            <span className="font-semibold text-white">{formatCurrency(price)}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <Person className="h-4 w-4" />
              <span>Status:</span>
            </span>
            <span className="font-semibold text-green-500">Active</span>
          </div>

          <div className="mt-4 p-2 bg-white/10 rounded text-xs text-gray-200 text-center">
            Present this QR code at the stadium entrance. Ticket valid only for the specified match and seat.
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for ticket lists
export const CompactTicketQR = ({ ticket }) => {
  if (!ticket) return null

  const qrData = generateQRData(ticket.id, ticket.match?.id, ticket.seat_number)

  return (
    <div className="flex items-center space-x-3 p-2 bg-white/20 backdrop-blur-lg rounded-lg">
      <QRCode 
        value={qrData} 
        size={64}
        level="M"
        data-ticket-id={ticket.id}
      />
      <div>
        <p className="font-semibold text-sm text-white">{ticket.seat_number}</p>
        <p className="text-xs text-gray-200">
          {ticket.match?.home_team} vs {ticket.match?.away_team}
        </p>
      </div>
    </div>
  )
}

export default TicketQR