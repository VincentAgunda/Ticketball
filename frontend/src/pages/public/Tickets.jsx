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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] text-[#004700] px-6 text-center">
        <Warning className="h-14 w-14 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-semibold text-[#00008B] mb-2">
          Sign In Required
        </h1>
        <p className="text-gray-600 mb-6">
          Please sign in to view your tickets.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#00008B] text-white font-semibold hover:bg-[#004700] transition-all"
        >
          Sign In
        </a>
      </div>
    )
  }

  if (loading) return <PageLoader />

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] text-[#004700] px-6 text-center">
        <Warning className="h-14 w-14 text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold text-[#00008B] mb-2">
          Error Loading Tickets
        </h1>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={refetch}
          className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00008B] text-white font-semibold hover:bg-[#004700] transition-all"
        >
          <Refresh className="!text-white" />
          Retry
        </button>
      </div>
    )
  }

  // ---------------- Ticket Card ----------------
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
      } catch {
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
          backgroundColor: "#ffffff",
        })

        const link = document.createElement("a")
        link.download = `ticket-${ticket.id}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
      } catch {
        setSmsStatus("Download failed")
      } finally {
        setDownloading(false)
      }
    }

    return (
      <div
        data-ticket-id={ticket.id}
        className="max-w-md mx-auto bg-[#F5F5F7] rounded-2xl shadow-lg p-6 border border-[#00008B]/20 transition-transform duration-300 hover:-translate-y-1"
      >
        <h2 className="text-lg font-bold text-[#00008B] text-center mb-4">
          Match Ticket
        </h2>

        {/* Teams */}
        <div className="flex justify-between items-center mb-6 relative">
          {[ticket.match.home_team, ticket.match.away_team].map((team, idx) => (
            <div key={team + idx} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#00008B] shadow-md">
                <img
                  src={getTeamLogo(team)}
                  alt={team}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 font-medium text-sm text-[#004700] text-center">
                {team}
              </p>
            </div>
          ))}
          <p className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-[#00008B]">
            VS
          </p>
        </div>

        {/* QR */}
        <div className="flex justify-center my-4 bg-[#004700] p-3 rounded-xl shadow-inner">
          <TicketQR ticket={ticket} size={110} compact />
        </div>

        {/* Info List */}
        <div className="divide-y divide-[#00008B]/10 mt-5 bg-white rounded-xl shadow-sm overflow-hidden">
          {[
            { icon: <CalendarToday />, label: formatDate(ticket.match.match_date) },
            { icon: <LocationOn />, label: ticket.match.venue },
            { icon: <EventSeat />, label: ticket.seat_number },
            { icon: <ConfirmationNumber />, label: formatCurrency(ticket.price) },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#F5F5F7] transition-colors"
            >
              <span className="text-[#00008B] text-sm">{item.icon}</span>
              <p className="text-[#004700] text-sm">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-between items-center">
          <button
            onClick={handleSendSMS}
            disabled={sendingSms}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#00008B] text-white text-sm font-semibold hover:bg-[#004700] transition-all"
          >
            <Sms fontSize="small" />
            {sendingSms ? "Sending..." : "Send SMS"}
          </button>
          <button
            onClick={handleDownloadTicket}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#FFD600] text-[#004700] text-sm font-semibold hover:bg-[#ffcc00] transition-all"
          >
            <Download fontSize="small" />
            {downloading ? "Downloading..." : "Download"}
          </button>
        </div>

        {smsStatus && (
          <p
            className={`mt-3 text-center text-xs ${
              smsStatus.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {smsStatus}
          </p>
        )}

        <p className="text-xs text-[#004700] mt-4 text-center">
          Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
    )
  }

  // Group tickets
  const activeTickets = ticketsWithMatches.filter(t =>
    ["active", "confirmed"].includes(t.status)
  )
  const usedTickets = ticketsWithMatches.filter(t => t.status === "used")
  const cancelledTickets = ticketsWithMatches.filter(t => t.status === "cancelled")

  // ---------------- Ticket Section ----------------
  const TicketSection = ({ title, tickets, emptyMessage }) => (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-[#00008B] mb-4 border-b border-[#00008B]/20 pb-2 text-center">
        {title}
      </h2>
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center rounded-2xl bg-[#F5F5F7] border border-[#00008B]/20">
          <ConfirmationNumber className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 text-[#00008B] hover:text-[#004700]"
            >
              <Refresh fontSize="small" />
              Refresh
            </button>
            <h1 className="text-3xl font-bold text-[#00008B]">My Tickets</h1>
            <div className="w-20"></div>
          </div>
          <p className="text-[#004700] text-base">
            Manage and access your football match tickets
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 text-center rounded-2xl bg-[#F5F5F7] border border-[#00008B]/20">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {activeTickets.length}
            </div>
            <p className="text-[#004700] font-medium">Active Tickets</p>
          </div>
          <div className="p-6 text-center rounded-2xl bg-[#F5F5F7] border border-[#00008B]/20">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {usedTickets.length}
            </div>
            <p className="text-[#004700] font-medium">Used Tickets</p>
          </div>
          <div className="p-6 text-center rounded-2xl bg-[#F5F5F7] border border-[#00008B]/20">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {cancelledTickets.length}
            </div>
            <p className="text-[#004700] font-medium">Cancelled Tickets</p>
          </div>
        </div>

        {/* Ticket Sections */}
        <TicketSection
          title=" Active Tickets"
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
      </div>
    </div>
  )
}

export default Tickets
