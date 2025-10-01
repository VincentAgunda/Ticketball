// src/components/MatchCard.jsx
import React from 'react'
import {
  CalendarToday,
  LocationOn,
  ConfirmationNumber,
} from '@mui/icons-material'
import { formatDate, formatCurrency } from '../utils/helpers'
import { motion } from 'framer-motion'
import { getTeamLogo } from '../utils/constants'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// Apple-inspired gradients using only grays + blues
const appleShades = [
  'linear-gradient(135deg, #f5f5f7 0%, #f2f4f8)',
  'linear-gradient(135deg, #dee0e0 , #dee0e0 )',
]

const MatchCard = ({
  match,
  onBookClick,
  shadeIndex = 0,
  currentTime = new Date(),
  customDelay = 0,
  allowGuestBooking = true, // ✅ Default to true for guest booking
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const matchDate = match.match_date?.toDate
    ? match.match_date.toDate()
    : new Date(match.match_date)
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

  const availabilityPercentage =
    total_seats > 0 ? (available_seats / total_seats) * 100 : 0
  const isSoldOut = available_seats === 0
  const isMatchOver = !isUpcoming

  // ✅ Updated handle booking click - allows guest booking
  const handleBookClick = () => {
    if (!user && !allowGuestBooking) {
      // Only redirect to login if guest booking is explicitly disabled
      navigate('/login', { 
        state: { 
          from: `/booking/${id}`,
          message: 'Please login to book tickets'
        }
      })
      return
    }

    // ✅ Always navigate to booking page for both authenticated and guest users
    navigate(`/booking/${id}`)
    
    // Call the optional onBookClick callback if provided
    if (onBookClick) onBookClick(match)
  }

  // ✅ Get button text based on user status
  const getButtonText = () => {
    if (isSoldOut) return 'Sold Out'
    if (isMatchOver) return 'Completed'
    if (!user && allowGuestBooking) return 'Book Now' // ✅ Indicate guest booking
    return 'Book Now'
  }

  // ✅ Get button tooltip/hint
  const getButtonHint = () => {
    if (!user && allowGuestBooking) {
      return 'Book without creating an account'
    }
    return ''
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.7,
        ease: 'easeOut',
        delay: customDelay,
      }}
    >
      <div
        className="rounded-3xl shadow-sm hover:shadow-xl
                   border border-gray-200/60 p-6
                   transition-all duration-500 hover:-translate-y-1"
        style={{
          background: appleShades[shadeIndex % appleShades.length],
        }}
      >
        {/* Date & Venue */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-700 text-sm space-x-2">
            <CalendarToday fontSize="small" />
            <span>
              {formatDate(matchDate, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center text-gray-700 text-sm space-x-1">
            <LocationOn fontSize="small" />
            <span>{venue || 'TBD'}</span>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          {/* Home Team */}
          <div className="text-center flex-1 group">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
              <img
                src={getTeamLogo(home_team)}
                alt={home_team}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <h3 className="mt-2 font-semibold text-gray-900 text-sm md:text-base">
              {home_team || 'Home Team'}
            </h3>
          </div>

          <div className="px-4 text-gray-600 font-medium">vs</div>

          {/* Away Team */}
          <div className="text-center flex-1 group">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
              <img
                src={getTeamLogo(away_team)}
                alt={away_team}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <h3 className="mt-2 font-semibold text-gray-900 text-sm md:text-base">
              {away_team || 'Away Team'}
            </h3>
          </div>
        </div>

        {/* Time */}
        <div className="text-center mb-4 text-gray-700 text-sm">
          {formatDate(matchDate, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>

        {/* Availability */}
        <div className="mb-6">
          {isMatchOver ? (
            <div className="text-center text-red-500 font-medium">
              Match Completed
            </div>
          ) : isSoldOut ? (
            <div className="text-center text-red-500 font-medium">Sold Out</div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-700">
                <span>Seats Left</span>
                <span>{available_seats || 0}</span>
              </div>
              <div className="w-full bg-[#f8d7e3] rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    availabilityPercentage > 50
                      ? 'bg-green-500'
                      : availabilityPercentage > 20
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Guest booking indicator */}
        {!user && allowGuestBooking && !isSoldOut && isUpcoming && (
          <div className="mb-3 text-center">
            
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700 text-sm">
            <ConfirmationNumber fontSize="small" />
            <span className="ml-1">
              From {formatCurrency(ticket_price || 0)}
            </span>
          </div>
          {!isSoldOut && isUpcoming ? (
            <button
              onClick={handleBookClick}
              className="px-4 py-2 rounded-full text-sm font-medium
                         bg-[#0B1B32] text-white hover:bg-[#18314F]
                         transition-colors relative group"
              title={getButtonHint()} // ✅ Show hint on hover
            >
              {getButtonText()}
              {/* ✅ Tooltip for guest users */}
              {!user && allowGuestBooking && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                              bg-gray-800 text-white text-xs px-2 py-1 rounded 
                              opacity-0 group-hover:opacity-100 transition-opacity 
                              pointer-events-none whitespace-nowrap z-10">
                  Book without account
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 
                                w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              )}
            </button>
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
    </motion.div>
  )
}

export default MatchCard