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

// Apple-inspired clean gradients
const appleShades = [
  'linear-gradient(135deg, #f5f5f7 0%, #eaeaea 100%)',
  'linear-gradient(135deg, #e3e4e8 0%, #f9f9f9 100%)',
]

// Global Apple-like font style
const appleFont = {
  fontFamily:
    '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const MatchCard = ({
  match,
  onBookClick,
  shadeIndex = 0,
  currentTime = new Date(),
  customDelay = 0,
  allowGuestBooking = true,
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

  const handleBookClick = () => {
    if (!user && !allowGuestBooking) {
      navigate('/login', {
        state: {
          from: `/booking/${id}`,
          message: 'Please login to book tickets',
        },
      })
      return
    }
    navigate(`/booking/${id}`)
    if (onBookClick) onBookClick(match)
  }

  const getButtonText = () => {
    if (isSoldOut) return 'Sold Out'
    if (isMatchOver) return 'Completed'
    return 'Book Now'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: customDelay }}
    >
      <div
        className="rounded-2xl shadow-md hover:shadow-2xl 
                   p-6 transition-all duration-500 hover:-translate-y-1
                   border border-gray-100"
        style={{ 
          background: appleShades[shadeIndex % appleShades.length],
          ...appleFont 
        }}
      >
        {/* Date & Venue */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-700 text-sm font-medium space-x-2">
            <CalendarToday fontSize="small" />
            <span>
              {formatDate(matchDate, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center text-gray-700 text-sm font-medium space-x-1">
            <LocationOn fontSize="small" />
            <span>{venue || 'TBD'}</span>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1 group">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border border-gray-200 shadow">
              <img
                src={getTeamLogo(home_team)}
                alt={home_team}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <h3 className="mt-2 font-semibold text-gray-900 text-base">
              {home_team || 'Home Team'}
            </h3>
          </div>

          <div className="px-4 text-gray-600 font-semibold">vs</div>

          <div className="text-center flex-1 group">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border border-gray-200 shadow">
              <img
                src={getTeamLogo(away_team)}
                alt={away_team}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <h3 className="mt-2 font-semibold text-gray-900 text-base">
              {away_team || 'Away Team'}
            </h3>
          </div>
        </div>

       
        {/* Availability */}
        <div className="mb-6">
          {isMatchOver ? (
            <div className="text-center text-red-600 font-semibold">
              Match Completed
            </div>
          ) : isSoldOut ? (
            <div className="text-center text-red-600 font-semibold">Sold Out</div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>Seats Left</span>
                <span>{available_seats || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    availabilityPercentage > 50
                      ? 'bg-green-500'
                      : availabilityPercentage > 20
                      ? 'bg-yellow-400'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700 text-sm font-medium">
            <ConfirmationNumber fontSize="small" />
            <span className="ml-1">
              From {formatCurrency(ticket_price || 0)}
            </span>
          </div>
          {!isSoldOut && isUpcoming ? (
            <button
              onClick={handleBookClick}
              className="px-4 py-2 rounded-full text-sm font-semibold
                         bg-blue-600 text-white hover:bg-blue-700
                         transition-colors shadow-sm"
            >
              {getButtonText()}
            </button>
          ) : (
            <span className="px-4 py-2 rounded-full text-sm font-semibold
                           bg-gray-200 text-gray-500 cursor-not-allowed">
              {getButtonText()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MatchCard
