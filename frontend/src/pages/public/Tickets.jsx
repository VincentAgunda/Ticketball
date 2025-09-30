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
        home_team: ticket.home_team || 'Unknown Team',
        away_team: ticket.away_team || 'Unknown Team',
        match_date: ticket.match_date || ticket.created_at,
        venue: ticket.venue || 'Unknown Venue'
      }
    }
  })

  // Glass style
  const glassClass = "bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg rounded-xl"

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}>
        <div className={`${glassClass} p-8 w-full max-w-md text-center`}>
          <Warning className="h-14 w-14 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
          <p className="text-gray-200 mb-6">Please sign in to view your tickets</p>
          <a href="/login" className="bg-[#FFD600] text-[#032f30] px-6 py-3 rounded-lg font-medium hover:bg-[#e6c200] transition inline-block">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  if (loading) return <PageLoader />
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}>
        <div className={`${glassClass} p-8 w-full max-w-md text-center`}>
          <Warning className="h-14 w-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Tickets</h2>
          <p className="text-gray-200">{error}</p>
          <button onClick={refetch} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    )
  }

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
          setSmsStatus("Error: No phone number found in ticket data")
          return
        }

        const result = await smsService.sendTicketSMS(ticket, {
          id: user.uid,
          email: user.email,
          phoneNumber: phoneNumber
        })
        
        if (result.success) {
          setSmsStatus("SMS sent successfully!")
        } else {
          setSmsStatus("Failed to send SMS: " + (result.message || "Unknown error"))
        }
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message
        setSmsStatus("Error sending SMS: " + errorMessage)
      } finally {
        setSendingSms(false)
      }
    }

    const handleDownloadTicket = async () => {
      setDownloading(true)
      try {
        const ticketElement = document.querySelector(`[data-ticket-id="${ticket.id}"]`)
        
        if (!ticketElement) {
          throw new Error('Ticket element not found')
        }

        const clone = ticketElement.cloneNode(true)
        clone.style.transform = 'scale(1.2)'
        clone.style.margin = '20px'
        clone.style.position = 'fixed'
        clone.style.left = '0'
        clone.style.top = '0'
        clone.style.zIndex = '9999'
        document.body.appendChild(clone)

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#0a2e36',
          logging: false,
        })

        document.body.removeChild(clone)

        const link = document.createElement('a')
        link.download = `ticket-${ticket.match.home_team}-vs-${ticket.match.away_team}-${ticket.seat_number}.png`
        link.href = canvas.toDataURL('image/png')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

      } catch (error) {
        const canvas = document.querySelector(`canvas[data-ticket-id="${ticket.id}"]`)
        if (canvas) {
          const link = document.createElement('a')
          link.download = `qr-code-${ticket.seat_number}.png`
          link.href = canvas.toDataURL('image/png')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else {
          setSmsStatus("Download failed: Could not generate ticket image")
        }
      } finally {
        setDownloading(false)
      }
    }

    const safeFormatDate = (dateString) => {
      try {
        if (!dateString) return 'Date not available'
        
        if (dateString && typeof dateString === 'object' && dateString.toDate) {
          dateString = dateString.toDate()
        }
        
        const date = new Date(dateString)
        
        if (isNaN(date.getTime())) {
          return 'Date not available'
        }

        return date.toLocaleDateString('en-KE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Africa/Nairobi'
        })
      } catch (error) {
        return 'Date not available'
      }
    }

    return (
      <div className={`${glassClass} overflow-hidden`}>
        <div 
          data-ticket-id={ticket.id}
          className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-400 rounded-lg shadow-2xl"
          style={{ minWidth: '400px' }}
        >
          <div className="text-center mb-6 border-b border-yellow-400 pb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <ConfirmationNumber className="h-8 w-8 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">FootballTickets</h2>
            </div>
            <p className="text-gray-200 text-sm">Official Digital Ticket</p>
            <p className="text-xs text-gray-400 mt-1">Ticket ID: {ticket.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-300 mb-1">Scan QR Code</p>
                <p className="text-xs text-gray-400">at stadium entrance</p>
              </div>
              <TicketQR 
                ticket={ticket} 
                size={140}
                showDetails={false}
              />
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-300">Ticket ID</p>
                <p className="font-mono font-bold text-white text-sm">
                  {ticket.id?.slice(0, 8).toUpperCase() || 'N/A'}
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {ticket.match.home_team} vs {ticket.match.away_team}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ticket.status === "active" ? "bg-green-500 text-white" :
                  ticket.status === "confirmed" ? "bg-green-500 text-white" :
                  ticket.status === "used" ? "bg-blue-500 text-white" :
                  "bg-red-500 text-white"
                }`}>
                  {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1) || 'Active'}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                  <CalendarToday className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-gray-300 text-xs">Date & Time</p>
                    <p className="text-white font-semibold">{safeFormatDate(ticket.match.match_date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                  <LocationOn className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-gray-300 text-xs">Venue</p>
                    <p className="text-white font-semibold">{ticket.match.venue}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                  <EventSeat className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-gray-300 text-xs">Seat Number</p>
                    <p className="text-white font-semibold">
                      {ticket.seat_number}
                      {ticket.seat_type && (
                        <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-1 rounded">
                          {ticket.seat_type}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
                  <ConfirmationNumber className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-gray-300 text-xs">Price</p>
                    <p className="text-white font-semibold">{formatCurrency(ticket.price)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-black/40 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-200 flex items-center">
                      <Sms className="h-4 w-4 mr-2 text-blue-400" />
                      <strong>SMS Notification:</strong> 
                      <span className={`ml-2 ${ticket.sms_sent ? 'text-green-400' : 'text-yellow-400'}`}>
                        {ticket.sms_sent ? "✓ Sent to your phone" : "Click to send SMS"}
                      </span>
                    </p>
                    {smsStatus && (
                      <p className={`text-xs mt-1 ${
                        smsStatus.includes("success") ? "text-green-300" : 
                        smsStatus.includes("Error") ? "text-red-300" : "text-yellow-300"
                      }`}>
                        {smsStatus}
                      </p>
                    )}
                    {!ticket.user_phone && (
                      <p className="text-xs text-red-300 mt-1">
                        No phone number found for this ticket. SMS cannot be sent.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSendSMS}
                    disabled={sendingSms || !ticket.user_phone}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                  >
                    <Sms className="h-4 w-4" />
                    <span>{sendingSms ? "Sending..." : "Send SMS"}</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                <p className="text-xs text-yellow-100">
                  <strong>Important:</strong> Present this QR code at the stadium entrance. 
                  The ticket is valid only for the specified match and seat.
                  {ticket.status === "active" && " Please arrive at least 1 hour before the match."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/20 bg-black/30 flex justify-between items-center">
          <div className="text-sm text-gray-300">
            <span>Purchased on {safeFormatDate(ticket.created_at)}</span>
          </div>
          <button
            onClick={handleDownloadTicket}
            disabled={downloading}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50 transition"
          >
            <Download className="h-5 w-5" />
            <span>{downloading ? "Downloading..." : "Download Ticket"}</span>
          </button>
        </div>
      </div>
    )
  }

  const activeTickets = ticketsWithMatches?.filter((t) => t.status === "active" || t.status === "confirmed") || []
  const usedTickets = ticketsWithMatches?.filter((t) => t.status === "used") || []
  const cancelledTickets = ticketsWithMatches?.filter((t) => t.status === "cancelled") || []

  const TicketSection = ({ title, tickets, emptyMessage }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/20 pb-2">{title}</h2>
      {tickets.length > 0 ? (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className={`${glassClass} p-12 text-center`}>
          <ConfirmationNumber className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-300 text-lg font-medium">{emptyMessage}</h3>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-cover bg-center py-12 bg-fixed" style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-4">
            <button onClick={refetch} className="flex items-center space-x-2 text-white hover:underline">
              <Refresh className="h-5 w-5" />
              <span>Refresh</span>
            </button>
            <h1 className="text-4xl font-bold text-white">My Tickets</h1>
            <div className="w-20"></div>
          </div>
          <p className="text-gray-300 text-lg">Manage and access your football match tickets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className={`${glassClass} p-6 text-center hover:transform hover:scale-105 transition`}>
            <div className="text-3xl font-bold text-green-400 mb-2">{activeTickets.length}</div>
            <p className="text-gray-300 font-medium">Active Tickets</p>
          </div>
          <div className={`${glassClass} p-6 text-center hover:transform hover:scale-105 transition`}>
            <div className="text-3xl font-bold text-blue-400 mb-2">{usedTickets.length}</div>
            <p className="text-gray-300 font-medium">Used Tickets</p>
          </div>
          <div className={`${glassClass} p-6 text-center hover:transform hover:scale-105 transition`}>
            <div className="text-3xl font-bold text-red-400 mb-2">{cancelledTickets.length}</div>
            <p className="text-gray-300 font-medium">Cancelled Tickets</p>
          </div>
        </div>

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

        {ticketsWithMatches.length === 0 && (
          <div className={`${glassClass} p-12 text-center mt-8`}>
            <ConfirmationNumber className="h-20 w-20 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">No Tickets Yet</h3>
            <p className="text-gray-300 mb-6 text-lg">Start by booking tickets for an upcoming match!</p>
            <a href="/matches" className="bg-[#FFD600] text-[#032f30] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#e6c200] transition inline-block">
              Browse Matches
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tickets