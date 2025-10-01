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
  Sms,
  Refresh,
} from "@mui/icons-material"
import { formatDate, formatCurrency } from "../../utils/helpers"
import { smsService } from "../../services/api"
import { getTeamLogo } from "../../utils/constants"
import html2canvas from "html2canvas"

const Tickets = () => {
  const { user } = useAuth()
  const { tickets, loading, error, refetch } = useUserTickets(user?.uid)
  const { matches } = useMatches()

  // Combine tickets with match data
  const ticketsWithMatches = tickets.map(ticket => {
    const match = matches.find(m => m.id === ticket.match_id)

    return {
      ...ticket,
      match: match || {
        home_team: ticket.home_team || "Unknown Team",
        away_team: ticket.away_team || "Unknown Team",
        match_date: ticket.match_date || ticket.created_at,
        venue: ticket.venue || "Unknown Venue",
      },
    }
  })

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}
      >
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 w-full max-w-md text-center rounded-3xl shadow-lg border border-gray-700">
          <Warning className="h-14 w-14 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
          <p className="text-gray-300 mb-6">Please sign in to view your tickets</p>
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
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 w-full max-w-md text-center rounded-3xl shadow-lg border border-gray-700">
          <Warning className="h-14 w-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Tickets</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // -------- TicketCard inside Tickets page --------
  const TicketCard = ({ ticket }) => {
    const [smsStatus, setSmsStatus] = React.useState(null)
    const [sendingSms, setSendingSms] = React.useState(false)
    const [downloading, setDownloading] = React.useState(false)

    const handleSendSMS = async () => {
      setSendingSms(true)
      setSmsStatus(null)

      try {
        const phoneNumber = ticket.user_phone
        if (!phoneNumber) {
          setSmsStatus("Error: No phone number found")
          return
        }

        const result = await smsService.sendTicketSMS(ticket, {
          id: user.uid,
          email: user.email,
          phoneNumber,
        })

        setSmsStatus(result.success ? "SMS sent successfully!" : "Failed to send SMS")
      } catch (err) {
        setSmsStatus("Error sending SMS")
      } finally {
        setSendingSms(false)
      }
    }

    const handleDownloadTicket = async () => {
      setDownloading(true)
      try {
        const ticketElement = document.querySelector(`[data-ticket-id="${ticket.id}"]`)
        if (!ticketElement) throw new Error("Ticket element not found")

        const canvas = await html2canvas(ticketElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#0a2e36",
        })

        const link = document.createElement("a")
        link.download = `ticket-${ticket.id}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
      } catch (err) {
        setSmsStatus("Download failed")
      } finally {
        setDownloading(false)
      }
    }

    return (
      <div
        data-ticket-id={ticket.id}
        className="rounded-3xl shadow-sm border border-gray-700 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-gray-900 to-gray-800"
      >
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Section */}
          <div className="flex flex-col items-center justify-center">
            <TicketQR ticket={ticket} size={140} />
            <p className="mt-4 font-mono text-xs text-gray-400">
              ID: {ticket.id?.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Match Section */}
          <div className="lg:col-span-2">
            {/* Teams */}
            <div className="flex justify-between items-center mb-6">
              {/* Home Team */}
              <div className="text-center flex-1 group">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                  <img
                    src={getTeamLogo(ticket.match.home_team)}
                    alt={ticket.match.home_team}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="mt-2 font-semibold text-white text-sm md:text-base">
                  {ticket.match.home_team}
                </h3>
              </div>

              <div className="px-4 text-gray-300 font-medium">vs</div>

              {/* Away Team */}
              <div className="text-center flex-1 group">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                  <img
                    src={getTeamLogo(ticket.match.away_team)}
                    alt={ticket.match.away_team}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="mt-2 font-semibold text-white text-sm md:text-base">
                  {ticket.match.away_team}
                </h3>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                <CalendarToday className="h-5 w-5 text-yellow-400" />
                <p className="text-white">{formatDate(ticket.match.match_date)}</p>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                <LocationOn className="h-5 w-5 text-yellow-400" />
                <p className="text-white">{ticket.match.venue}</p>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                <EventSeat className="h-5 w-5 text-yellow-400" />
                <p className="text-white">{ticket.seat_number}</p>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                <ConfirmationNumber className="h-5 w-5 text-yellow-400" />
                <p className="text-white">{formatCurrency(ticket.price)}</p>
              </div>
            </div>

            {/* SMS + Download */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={handleSendSMS}
                disabled={sendingSms}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <Sms className="h-4 w-4" />
                <span>{sendingSms ? "Sending..." : "Send SMS"}</span>
              </button>

              <button
                onClick={handleDownloadTicket}
                disabled={downloading}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400"
              >
                <Download className="h-4 w-4" />
                <span>{downloading ? "Downloading..." : "Download"}</span>
              </button>
            </div>

            {smsStatus && (
              <p
                className={`mt-2 text-xs ${
                  smsStatus.includes("success") ? "text-green-300" : "text-red-300"
                }`}
              >
                {smsStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Group tickets
  const activeTickets = ticketsWithMatches.filter(t => ["active", "confirmed"].includes(t.status))
  const usedTickets = ticketsWithMatches.filter(t => t.status === "used")
  const cancelledTickets = ticketsWithMatches.filter(t => t.status === "cancelled")

  // Ticket Section
  const TicketSection = ({ title, tickets, emptyMessage }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
        {title}
      </h2>
      {tickets.length > 0 ? (
        <div className="space-y-6">{tickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}</div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
          <ConfirmationNumber className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-300 text-lg font-medium">{emptyMessage}</h3>
        </div>
      )}
    </div>
  )

  return (
    <div
      className="min-h-screen bg-cover bg-center py-12 bg-fixed"
      style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={refetch}
              className="flex items-center space-x-2 text-white hover:underline"
            >
              <Refresh className="h-5 w-5" />
              <span>Refresh</span>
            </button>
            <h1 className="text-4xl font-bold text-white">My Tickets</h1>
            <div className="w-20"></div>
          </div>
          <p className="text-gray-300 text-lg">Manage and access your football match tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 text-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
            <div className="text-3xl font-bold text-green-400 mb-2">{activeTickets.length}</div>
            <p className="text-gray-300 font-medium">Active Tickets</p>
          </div>
          <div className="p-6 text-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">{usedTickets.length}</div>
            <p className="text-gray-300 font-medium">Used Tickets</p>
          </div>
          <div className="p-6 text-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
            <div className="text-3xl font-bold text-red-400 mb-2">{cancelledTickets.length}</div>
            <p className="text-gray-300 font-medium">Cancelled Tickets</p>
          </div>
        </div>

        {/* Sections */}
        <TicketSection
          title="🎟️ Active Tickets"
          tickets={activeTickets}
          emptyMessage="No active tickets found. Book your first match to get started!"
        />
        <TicketSection
          title="📋 Used Tickets"
          tickets={usedTickets}
          emptyMessage="No used tickets yet. Your match history will appear here."
        />
        <TicketSection
          title="❌ Cancelled Tickets"
          tickets={cancelledTickets}
          emptyMessage="No cancelled tickets"
        />
      </div>
    </div>
  )
}

export default Tickets
