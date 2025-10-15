import React from "react"
import {
  CalendarToday,
  LocationOn,
  EventSeat,
} from "@mui/icons-material"
import { getTeamLogo } from "../../utils/constants"

// Apple Card styling constants
const appleCardStyle = {
  background: "#ffffff",
  borderRadius: "1.25rem",
  boxShadow:
    "0 2px 6px rgba(0, 0, 0, 0.08), 0 6px 20px rgba(0, 0, 0, 0.06)",
  fontFamily:
    '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: "#0B1B32",
}

/**
 * BookingCard — Apple-style premium design
 */
const BookingCard = ({
  match,
  matchDate,
  selectedTickets = [],
  totalSeatsSelected = 0,
  totalAmount = 0,
  formatDate = (d) => d,
  formatCurrency = (n) => n,
}) => {
  if (!match) return null

  return (
    <div
      className="sticky top-6 transition-transform duration-300 hover:-translate-y-1"
      style={appleCardStyle}
    >
      <div className="p-6">
        {/* Title */}
        <h2 className="text-[1.4rem] font-semibold mb-6 tracking-tight text-[#0B1B32]">
          Match Details
        </h2>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={getTeamLogo(match.home_team)}
                alt={match.home_team}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[0.9rem] mt-2 font-medium text-[#1a1f36] tracking-tight">
              {match.home_team}
            </span>
          </div>

          <span className="font-semibold text-lg text-[#1a1f36] tracking-tight">
            VS
          </span>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={getTeamLogo(match.away_team)}
                alt={match.away_team}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[0.9rem] mt-2 font-medium text-[#1a1f36] tracking-tight">
              {match.away_team}
            </span>
          </div>
        </div>

        {/* Match Info */}
        <div className="space-y-4 text-[#1a1f36]">
          <div className="flex items-center space-x-3">
            <CalendarToday className="h-5 w-5 text-[#0B1B32]" />
            <div className="text-[0.95rem] font-medium opacity-90 tracking-tight">
              {matchDate ? formatDate(matchDate) : "Date not available"}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <LocationOn className="h-5 w-5 text-[#0B1B32]" />
            <div className="text-[0.95rem] font-medium opacity-90 tracking-tight">
              {match.venue || "TBD"}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200" />

        {/* Price Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#2e2e2e] font-medium tracking-tight">
              Base Ticket Price
            </span>
            <span className="font-semibold text-[#0B1B32] tracking-tight">
              {formatCurrency(match.ticket_price || 0)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#2e2e2e] font-medium tracking-tight">
              Available Seats
            </span>
            <span
              className={`font-semibold tracking-tight ${
                (match.available_seats || 0) < 10
                  ? "text-red-600"
                  : "text-green-700"
              }`}
            >
              {match.available_seats ?? "N/A"}
            </span>
          </div>
        </div>

        {/* Selected Tickets */}
        {selectedTickets.length > 0 && (
          <>
            <div className="my-6 border-t border-gray-200" />
            <h3 className="font-semibold mb-3 flex items-center text-[#0B1B32] text-lg tracking-tight">
              <EventSeat className="h-5 w-5 mr-2 text-[#0B1B32]" />
              Selected Tickets ({totalSeatsSelected})
            </h3>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {selectedTickets.map((ticket, index) => (
                <div
                  key={`${ticket.type}-${index}`}
                  className="flex justify-between text-sm p-3 rounded-xl border border-gray-100 bg-[#e5e5e5] hover:bg-[#f2f2f2] transition-colors duration-200"
                >
                  <span className="font-medium text-[#1a1f36] tracking-tight">
                    {ticket.quantity} × {ticket.type.toUpperCase()} Ticket
                    {ticket.quantity > 1 ? "s" : ""}
                  </span>
                  <span className="font-semibold text-[#0B1B32] tracking-tight">
                    {formatCurrency(ticket.price * ticket.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-5 pt-4 font-semibold flex justify-between text-lg text-[#0B1B32] tracking-tight">
              <span>Total:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BookingCard
