// src/pages/Tickets.jsx
import React from "react"
import { useAuth } from "../../context/AuthContext"
import { useUserTickets, useMatches } from "../../hooks/useFirebase"
import TicketQR from "../../components/TicketQR"
import { PageLoader } from "../../components/LoadingSpinner"
import {
  ConfirmationNumber,
  CalendarToday,
  LocationOn,
  EventSeat,
  Download,
  Warning,
} from "@mui/icons-material"
import { formatDate, formatCurrency } from "../../utils/helpers"

const Tickets = () => {
  const { user } = useAuth()
  const { tickets, loading, error } = useUserTickets(user?.uid)
  const { matches } = useMatches()

  // Combine tickets with match data
  const ticketsWithMatches = tickets.map(ticket => {
    const match = matches.find(m => m.id === ticket.match_id)
    return {
      ...ticket,
      match: match || {
        home_team: 'Unknown Team',
        away_team: 'Unknown Team',
        match_date: ticket.created_at,
        venue: 'Unknown Venue'
      }
    }
  })

  // Glass style (reuse everywhere for consistency)
  const glassClass =
    "bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg rounded-xl"

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}
      >
        <div className={`${glassClass} p-8 w-full max-w-md text-center`}>
          <Warning className="h-14 w-14 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
          <p className="text-gray-200 mb-6">Please sign in to view your tickets</p>
          <a
            href="/login"
            className="bg-[#FFD600] text-[#032f30] px-6 py-3 rounded-lg font-medium hover:bg-[#e6c200] transition inline-block"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  if (loading) return <PageLoader />
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}
      >
        <div className={`${glassClass} p-8 w-full max-w-md text-center`}>
          <Warning className="h-14 w-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Tickets</h2>
          <p className="text-gray-200">{error}</p>
        </div>
      </div>
    )
  }

  const activeTickets = ticketsWithMatches?.filter((t) => t.status === "active") || []
  const usedTickets = ticketsWithMatches?.filter((t) => t.status === "used") || []
  const cancelledTickets = ticketsWithMatches?.filter((t) => t.status === "cancelled") || []

  const TicketCard = ({ ticket }) => (
    <div className={`${glassClass} overflow-hidden`}>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR */}
          <div className="flex justify-center">
            <TicketQR ticket={ticket} size={120} />
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {ticket.match.home_team} vs {ticket.match.away_team}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ticket.status === "active"
                    ? "bg-green-500/30 text-green-200"
                    : ticket.status === "used"
                    ? "bg-blue-500/30 text-blue-200"
                    : "bg-red-500/30 text-red-200"
                }`}
              >
                {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1) || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-200">
              <div className="flex items-center space-x-2">
                <CalendarToday className="h-4 w-4 text-yellow-300" />
                <span>{formatDate(ticket.match.match_date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <LocationOn className="h-4 w-4 text-yellow-300" />
                <span>{ticket.match.venue}</span>
              </div>
              <div className="flex items-center space-x-2">
                <EventSeat className="h-4 w-4 text-yellow-300" />
                <span>Seat {ticket.seat_number}</span>
                {ticket.seat_type && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {ticket.seat_type}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <ConfirmationNumber className="h-4 w-4 text-yellow-300" />
                <span>Price: {formatCurrency(ticket.price)}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-xs text-gray-200">
                <strong>Important:</strong> Present this QR code at the stadium entrance. The ticket is valid only for the specified match and seat.
                {ticket.status === "active" && " Please arrive at least 1 hour before the match."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-white/20 flex justify-between items-center text-sm text-gray-200">
        <span>Purchased on {formatDate(ticket.created_at)}</span>
        <button
          onClick={() => {
            // Find the canvas element for this ticket's QR code
            const canvas = document.querySelector(`canvas[data-ticket-id="${ticket.id}"]`)
            if (canvas) {
              const link = document.createElement("a")
              link.download = `ticket-${ticket.seat_number}-${ticket.id.slice(0, 8)}.png`
              link.href = canvas.toDataURL()
              link.click()
            } else {
              // Fallback: try to download the QR code from the component
              const qrComponent = document.querySelector(`[data-ticket-id="${ticket.id}"]`)
              if (qrComponent) {
                const canvas = qrComponent.querySelector('canvas')
                if (canvas) {
                  const link = document.createElement("a")
                  link.download = `ticket-${ticket.seat_number}-${ticket.id.slice(0, 8)}.png`
                  link.href = canvas.toDataURL()
                  link.click()
                }
              }
            }
          }}
          className="flex items-center space-x-1 hover:underline text-yellow-300 hover:text-yellow-200 transition"
        >
          <Download className="h-4 w-4" />
          <span>Download QR</span>
        </button>
      </div>
    </div>
  )

  const TicketSection = ({ title, tickets, emptyMessage }) => (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      {tickets.length > 0 ? (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className={`${glassClass} p-12 text-center`}>
          <ConfirmationNumber className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-200 font-medium">{emptyMessage}</h3>
        </div>
      )}
    </div>
  )

  return (
    <div
      className="min-h-screen bg-cover bg-center py-12"
      style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-gray-200">Manage and access your football match tickets</p>
          <div className="mt-4 text-sm text-gray-300">
            {ticketsWithMatches.length} total ticket(s)
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className={`${glassClass} p-6 text-center`}>
            <div className="text-2xl font-bold text-white">{activeTickets.length}</div>
            <p className="text-gray-200">Active Tickets</p>
          </div>
          <div className={`${glassClass} p-6 text-center`}>
            <div className="text-2xl font-bold text-white">{usedTickets.length}</div>
            <p className="text-gray-200">Used Tickets</p>
          </div>
          <div className={`${glassClass} p-6 text-center`}>
            <div className="text-2xl font-bold text-white">{cancelledTickets.length}</div>
            <p className="text-gray-200">Cancelled Tickets</p>
          </div>
        </div>

        {/* Ticket Sections */}
        <TicketSection 
          title="Active Tickets" 
          tickets={activeTickets} 
          emptyMessage="No active tickets found. Book your first match to get started!" 
        />
        <TicketSection 
          title="Used Tickets" 
          tickets={usedTickets} 
          emptyMessage="No used tickets yet. Your match history will appear here." 
        />
        <TicketSection 
          title="Cancelled Tickets" 
          tickets={cancelledTickets} 
          emptyMessage="No cancelled tickets" 
        />

        {/* Help Section */}
        <div className={`${glassClass} p-6 mt-12`}>
          <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-200">
            <div>
              <h4 className="font-medium text-white mb-1">Ticket Issues</h4>
              <p>
                If you're having trouble with your ticket, contact our support team at support@footballtickets.com or call +254 700 123 456.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Stadium Entry</h4>
              <p>
                Present your QR code at the gate. Make sure your phone brightness is turned up for easy scanning. Arrive early to avoid queues.
              </p>
            </div>
          </div>
        </div>

        {/* No Tickets Call to Action */}
        {ticketsWithMatches.length === 0 && (
          <div className={`${glassClass} p-8 text-center mt-8`}>
            <ConfirmationNumber className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Tickets Yet</h3>
            <p className="text-gray-200 mb-6">Start by booking tickets for an upcoming match!</p>
            <a
              href="/matches"
              className="bg-[#FFD600] text-[#032f30] px-6 py-3 rounded-lg font-medium hover:bg-[#e6c200] transition inline-block"
            >
              Browse Matches
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tickets