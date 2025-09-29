import React, { useState, useMemo } from 'react'
import { 
  Chair, 
  EventSeat,
  ConfirmationNumber,
  Warning
} from '@mui/icons-material'
import { generateSeatMap, calculateTicketPrice, formatCurrency } from '../utils/helpers'
import { APP_CONFIG } from '../utils/constants'

const SeatMap = ({ 
  match, 
  bookedSeats = [], 
  onSeatSelect,
  selectedSeats = [] 
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null)

  const seats = useMemo(() => {
    return generateSeatMap(match?.total_seats || 1000, bookedSeats)
  }, [match, bookedSeats])

  const handleSeatClick = (seat) => {
    if (!seat.available) return
    if (onSeatSelect) onSeatSelect(seat)
  }

  const getSeatColor = (seat) => {
    if (!seat.available) return 'bg-gray-200 text-gray-400 cursor-not-allowed'
    if (selectedSeats.some(s => s.number === seat.number)) return 'bg-[#EBF0F6] text-[#0B1B32] border border-[#D1D5DB]'

    switch (seat.type.toLowerCase()) {
      case 'vip':
        return 'bg-[#F4F3EF] text-[#0B1B32] hover:shadow-md'
      case 'premium':
        return 'bg-[#EBF0F6] text-[#0B1B32] hover:shadow-md'
      default:
        return 'bg-white text-[#0B1B32] hover:shadow-sm border border-gray-200'
    }
  }

  const getSeatPrice = (seat) => {
    return calculateTicketPrice(match?.ticket_price || 0, seat.type)
  }

  const getSeatTypeName = (type) => {
    return APP_CONFIG.seatTypes[type?.toUpperCase()]?.name || type
  }

  // Group seats by row
  const seatsByRow = useMemo(() => {
    const rows = {}
    seats.forEach(seat => {
      if (!rows[seat.row]) rows[seat.row] = []
      rows[seat.row].push(seat)
    })
    return rows
  }, [seats])

  if (!match) {
    return (
      <div className="text-center p-12 rounded-2xl bg-[#F4F3EF] shadow-md">
        <Warning className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No match selected</p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-[#E5E7EB] shadow-lg">
      {/* Stadium Overview */}
      <div className="text-center mb-10">
        <h3 className="text-3xl font-semibold text-[#0B1B32] mb-4">
          {match.venue} – Seat Selection
        </h3>
        <div className="flex justify-center flex-wrap gap-6 text-sm text-[#0B1B32]/80">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-white border border-gray-300"></div>
            <span>Standard ({formatCurrency(match.ticket_price)})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-[#F4F3EF] border border-gray-300"></div>
            <span>VIP ({formatCurrency(match.ticket_price * 1.5)})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-[#EBF0F6] border border-gray-300"></div>
            <span>Premium ({formatCurrency(match.ticket_price * 2)})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-gray-300"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-[#EBF0F6] border border-gray-400"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Pitch */}
      <div className="bg-gradient-to-r from-[#F4F3EF] to-[#EBF0F6] h-20 rounded-2xl mb-10 flex items-center justify-center shadow-inner">
        <span className="text-[#0B1B32] font-semibold tracking-wide">PITCH</span>
      </div>

      {/* Seat Map */}
      <div className="max-h-96 overflow-y-auto space-y-3">
        {Object.entries(seatsByRow).map(([rowNumber, rowSeats]) => (
          <div key={rowNumber} className="flex items-center justify-center">
            <span className="text-sm font-medium w-8 text-gray-500">
              {String.fromCharCode(64 + parseInt(rowNumber))}
            </span>
            <div className="flex space-x-2">
              {rowSeats.map((seat) => (
                <button
                  key={seat.number}
                  className={`
                    w-9 h-9 rounded-xl text-xs font-medium transition-all
                    flex items-center justify-center shadow-sm
                    ${getSeatColor(seat)}
                    ${seat.available ? 'cursor-pointer hover:scale-105' : ''}
                  `}
                  onClick={() => handleSeatClick(seat)}
                  onMouseEnter={() => setHoveredSeat(seat)}
                  onMouseLeave={() => setHoveredSeat(null)}
                  disabled={!seat.available}
                  title={seat.available ? 
                    `Seat ${seat.number} – ${getSeatTypeName(seat.type)} – ${formatCurrency(getSeatPrice(seat))}` : 
                    'Seat unavailable'
                  }
                >
                  {seat.available ? (
                    <EventSeat className="h-4 w-4" />
                  ) : (
                    <Chair className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-10 p-6 bg-[#F4F3EF] rounded-2xl shadow-lg border border-[#E5E7EB]">
          <h4 className="font-semibold text-[#0B1B32] mb-4 flex items-center">
            <ConfirmationNumber className="h-5 w-5 mr-2 text-[#0B1B32]" />
            Selected Seats ({selectedSeats.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedSeats.map(seat => (
              <div key={seat.number} className="bg-white/90 backdrop-blur rounded-xl p-4 shadow-sm border border-[#E5E7EB]">
                <div className="font-medium text-[#0B1B32]">{seat.number}</div>
                <div className="text-sm text-[#0B1B32]/70">{getSeatTypeName(seat.type)}</div>
                <div className="font-semibold text-[#0B1B32]">
                  {formatCurrency(getSeatPrice(seat))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
            <div className="flex justify-between font-semibold text-[#0B1B32]">
              <span>Total:</span>
              <span className="text-lg">{formatCurrency(selectedSeats.reduce((total, seat) => 
                total + getSeatPrice(seat), 0))}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredSeat && hoveredSeat.available && (
        <div className="fixed bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-[#E5E7EB] z-50 pointer-events-none">
          <div className="text-sm font-medium text-[#0B1B32]">Seat {hoveredSeat.number}</div>
          <div className="text-xs text-[#0B1B32]/70">
            {getSeatTypeName(hoveredSeat.type)}
          </div>
          <div className="text-sm font-semibold text-[#0B1B32]">
            {formatCurrency(getSeatPrice(hoveredSeat))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SeatMap
