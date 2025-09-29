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
      <div className="text-center p-8 text-dark-gray">
        <ConfirmationNumber className="h-16 w-16 mx-auto mb-4" />
        <p>No ticket data available</p>
      </div>
    )
  }

  const { 
    id, 
    seat_number, 
    price, 
    matches,
    user_id 
  } = ticket

  const qrData = generateQRData(id, matches?.id, seat_number)

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
      return
    }

    // Default download behavior
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = `ticket-${id}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  return (
    <div className="bg-light-gray rounded-xl shadow-lg p-6 max-w-md mx-auto">
      {/* Ticket Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <SportsSoccer className="h-8 w-8 text-primary-teal" />
          <h2 className="text-2xl font-bold text-primary-navy">FootballTickets</h2>
        </div>
        <p className="text-dark-gray">Digital Ticket</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <QRCode 
            value={qrData} 
            size={size}
            level="H"
            includeMargin
            className="border-4 border-white rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <SportsSoccer className="h-8 w-8 text-dark-gray opacity-20" />
          </div>
        </div>
      </div>

      {/* Ticket ID */}
      <div className="text-center mb-4">
        <p className="text-sm text-dark-gray">Ticket ID</p>
        <p className="font-mono font-semibold text-primary-navy">
          {id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full bg-primary-teal text-white py-2 rounded-lg font-semibold mb-6 hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
      >
        <Download />
        <span>Download QR Code</span>
      </button>

      {/* Ticket Details */}
      {showDetails && matches && (
        <div className="border-t border-medium-gray pt-6">
          <h3 className="font-semibold text-primary-navy mb-4 flex items-center">
            <ConfirmationNumber className="h-5 w-5 mr-2" />
            Ticket Information
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-dark-gray flex items-center space-x-2">
                <SportsSoccer className="h-4 w-4" />
                <span>Match:</span>
              </span>
              <span className="font-semibold text-primary-navy text-right">
                {matches.home_team} vs {matches.away_team}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-dark-gray flex items-center space-x-2">
                <CalendarToday className="h-4 w-4" />
                <span>Date & Time:</span>
              </span>
              <span className="font-semibold text-primary-navy text-right">
                {formatDate(matches.match_date)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-dark-gray flex items-center space-x-2">
                <LocationOn className="h-4 w-4" />
                <span>Venue:</span>
              </span>
              <span className="font-semibold text-primary-navy text-right">
                {matches.venue}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-dark-gray flex items-center space-x-2">
                <EventSeat className="h-4 w-4" />
                <span>Seat:</span>
              </span>
              <span className="font-semibold text-primary-navy">
                {seat_number}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-dark-gray flex items-center space-x-2">
                <span>💰</span>
                <span>Price:</span>
              </span>
              <span className="font-semibold text-primary-navy">
                {formatCurrency(price)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-dark-gray flex items-center space-x-2">
                <Person className="h-4 w-4" />
                <span>Status:</span>
              </span>
              <span className="font-semibold text-green-600">
                Active
              </span>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-6 p-3 bg-light-gray rounded-lg">
            <p className="text-xs text-dark-gray text-center">
              Present this QR code at the stadium entrance. 
              Ticket valid only for the specified match and seat.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for ticket lists
export const CompactTicketQR = ({ ticket }) => {
  if (!ticket) return null

  const qrData = generateQRData(ticket.id, ticket.matches?.id, ticket.seat_number)

  return (
    <div className="flex items-center space-x-3 p-3 bg-light-gray rounded-lg">
      <QRCode 
        value={qrData} 
        size={64}
        level="M"
      />
      <div>
        <p className="font-semibold text-sm">{ticket.seat_number}</p>
        <p className="text-xs text-dark-gray">
          {ticket.matches?.home_team} vs {ticket.matches?.away_team}
        </p>
      </div>
    </div>
  )
}

export default TicketQR