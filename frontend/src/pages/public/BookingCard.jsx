import React from 'react';
import {
  SportsSoccer,
  CalendarToday,
  LocationOn,
  EventSeat,
} from '@mui/icons-material';
import { getTeamLogo } from '../../utils/constants';

/**
 * Presentational BookingCard (left side match details and selected tickets)
 *
 * Props:
 * - match: match object
 * - matchDate: Date object or null
 * - selectedTickets: array
 * - totalSeatsSelected: number
 * - totalAmount: number
 * - formatDate: fn
 * - formatCurrency: fn
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
  if (!match) return null;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sticky top-6 border border-white/30">
      <h2 className="text-xl font-bold text-[#0B1B32] mb-4">Match Details</h2>

      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shadow-sm">
            <img
              src={getTeamLogo(match.home_team)}
              alt={match.home_team}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm mt-2">{match.home_team}</span>
        </div>

        <span className="font-bold text-lg">VS</span>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shadow-sm">
            <img
              src={getTeamLogo(match.away_team)}
              alt={match.away_team}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm mt-2">{match.away_team}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <SportsSoccer className="h-6 w-6 text-[#0B1B32]" />
          <div className="font-semibold">{match.home_team} vs {match.away_team}</div>
        </div>

        <div className="flex items-center space-x-3">
          <CalendarToday className="h-6 w-6 text-[#0B1B32]" />
          <div>{matchDate ? formatDate(matchDate) : 'Date not available'}</div>
        </div>

        <div className="flex items-center space-x-3">
          <LocationOn className="h-6 w-6 text-[#0B1B32]" />
          <div>{match.venue || 'TBD'}</div>
        </div>

        <div className="border-t border-white/30 pt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Base Ticket Price:</span>
            <span>{formatCurrency(match.ticket_price || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Available Seats:</span>
            <span className={`font-semibold ${ (match.available_seats || 0) < 10 ? 'text-red-600' : 'text-green-600'}`}>
              {match.available_seats ?? 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {selectedTickets.length > 0 && (
        <div className="border-t border-white/30 pt-4 mt-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <EventSeat className="h-5 w-5 mr-2 text-[#0B1B32]" />
            Selected Tickets ({totalSeatsSelected})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedTickets.map((ticket, index) => (
              <div key={`${ticket.type}-${index}`} className="flex justify-between text-sm bg-white/50 p-2 rounded-lg">
                <span>{ticket.quantity} x {ticket.type.toUpperCase()} Ticket{ticket.quantity > 1 ? 's' : ''}</span>
                <span className="font-medium">{formatCurrency(ticket.price * ticket.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/30 mt-3 pt-3 font-semibold flex justify-between text-lg">
            <span>Total:</span>
            <span className="text-[#0B1B32]">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
