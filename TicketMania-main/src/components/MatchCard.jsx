import React from 'react'
import { Link } from 'react-router-dom'
import {
  SportsSoccer,
  CalendarToday,
  LocationOn,
  ConfirmationNumber,
} from '@mui/icons-material'
import { formatDate, formatCurrency } from '../utils/helpers'

// Pastel shades with transparency for glassmorphism
const shades = [
  '#f5f5f7cc', // light gray
  '#eaf6fbcc', // soft blue
  '#fdf2f8cc', // soft pink
  '#f0fdf4cc', // soft green
  '#fefce8cc', // soft yellow
]

const MatchCard = ({ match, onBookClick, shadeIndex = 0, currentTime = new Date() }) => {
  // Handle Firebase timestamp conversion
  const matchDate = match.match_date?.toDate ? match.match_date.toDate() : new Date(match.match_date)
  const isUpcoming = matchDate > currentTime
  
  const {
    id,
    home_team,
    away_team,
    venue,
    ticket_price,
    available_seats,
    total_seats,
  } = match

  const availabilityPercentage = total_seats > 0 ? (available_seats / total_seats) * 100 : 0
  const isSoldOut = available_seats === 0
  const isMatchOver = !isUpcoming

  return (
    <div
      className="rounded-3xl shadow-md hover:shadow-lg 
                 border border-white/40 p-6 
                 transition-all duration-300"
      style={{
        background: shades[shadeIndex % shades.length],
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* Date & Venue */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-[#26415E] text-sm space-x-2">
          <CalendarToday fontSize="small" />
          <span>
            {formatDate(matchDate, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center text-[#26415E] text-sm space-x-1">
          <LocationOn fontSize="small" />
          <span>{venue || 'TBD'}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <SportsSoccer className="mx-auto text-[#0B1B32]" fontSize="large" />
          <h3 className="mt-2 font-semibold text-[#0B1B32] text-sm md:text-base">
            {home_team || 'Home Team'}
          </h3>
        </div>
        <div className="px-4 text-[#26415E] font-medium">vs</div>
        <div className="text-center flex-1">
          <SportsSoccer className="mx-auto text-[#0B1B32]" fontSize="large" />
          <h3 className="mt-2 font-semibold text-[#0B1B32] text-sm md:text-base">
            {away_team || 'Away Team'}
          </h3>
        </div>
      </div>

      {/* Time */}
      <div className="text-center mb-4 text-[#26415E] text-sm">
        {formatDate(matchDate, {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>

      {/* Availability */}
      <div className="mb-6">
        {isMatchOver ? (
          <div className="text-center text-red-600 font-medium">Match Completed</div>
        ) : isSoldOut ? (
          <div className="text-center text-red-600 font-medium">Sold Out</div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#26415E]">
              <span>Seats Left</span>
              <span>{available_seats || 0}</span>
            </div>
            <div className="w-full bg-gray-200/60 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  availabilityPercentage > 50 ? 'bg-green-500' : 
                  availabilityPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${availabilityPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-[#26415E] text-sm">
          <ConfirmationNumber fontSize="small" />
          <span className="ml-1">From {formatCurrency(ticket_price || 0)}</span>
        </div>
        {!isSoldOut && isUpcoming ? (
          <Link
            to={`/booking/${id}`}
            onClick={() => onBookClick && onBookClick(match)}
            className="px-4 py-2 rounded-full text-sm font-medium
                       bg-white/40 text-[#0B1B32] backdrop-blur-md border border-white/50
                       hover:bg-white/60 transition"
          >
            Book
          </Link>
        ) : isMatchOver ? (
          <span className="px-4 py-2 rounded-full text-sm font-medium
                         bg-gray-200 text-gray-500 cursor-not-allowed">
            Completed
          </span>
        ) : (
          <span className="px-4 py-2 rounded-full text-sm font-medium
                         bg-gray-200 text-gray-500 cursor-not-allowed">
            Sold Out
          </span>
        )}
      </div>
    </div>
  )
}

export default MatchCard