import React, { useEffect, useRef, useState } from "react"
import { QRCodeCanvas as QRCode } from "qrcode.react"
import {
  ConfirmationNumber,
  SportsSoccer,
  CalendarToday,
  LocationOn,
  EventSeat,
  Person,
  Download,
} from "@mui/icons-material"
import { formatDate, formatCurrency, generateQRData } from "../utils/helpers"
import { db } from "../lib/firebase"
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore"

const TicketQR = ({
  ticket,
  showDetails = true,
  size = 120,
  onDownload,
  compact = false,
}) => {
  const [qrImage, setQrImage] = useState(null)
  const [isUsed, setIsUsed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [liveTicket, setLiveTicket] = useState(ticket)
  const qrRef = useRef(null)

  if (!ticket) {
    return (
      <div className="text-center p-6 text-gray-200">
        <ConfirmationNumber className="h-12 w-12 mx-auto mb-3" />
        <p>No ticket data available</p>
      </div>
    )
  }

  const { id, seat_number, price, match } = ticket
  const qrData = generateQRData(id, match?.id, seat_number)

  /* -------------------------------------------------------------------------- */
  /* 🔄 Real-time Firestore listener for live ticket updates */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const ticketRef = doc(db, "tickets", id)
    const unsubscribe = onSnapshot(ticketRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        setLiveTicket((prev) => {
          const prevString = JSON.stringify(prev)
          const newString = JSON.stringify(data)
          if (prevString !== newString) {
            return data
          }
          return prev
        })
        setIsUsed(data.used || data.status === "used")
      }
    })

    return () => unsubscribe()
  }, [id])

  /* -------------------------------------------------------------------------- */
  /* 🧩 Convert canvas to image for printing (fixed: prevents infinite loop) */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const canvas = qrRef.current?.querySelector("canvas")
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png")
      setQrImage((prev) => (prev !== dataUrl ? dataUrl : prev))
    }

    // Check offline cache
    const usedQRCodes = JSON.parse(localStorage.getItem("usedQRCodes") || "[]")
    if (usedQRCodes.includes(id)) {
      setIsUsed(true)
    }
  }, [id])

  /* -------------------------------------------------------------------------- */
  /* 🧾 Download ticket as image */
  /* -------------------------------------------------------------------------- */
  const handleDownload = () => {
    if (onDownload) {
      onDownload()
      return
    }

    const ticketElement =
      document.querySelector(`[data-ticket-id="${id}"]`) ||
      document.querySelector(`canvas[data-ticket-id="${id}"]`)?.closest(
        ".bg-white\\/20"
      )

    if (ticketElement) {
      import("html2canvas")
        .then((html2canvas) => {
          html2canvas
            .default(ticketElement, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: null,
            })
            .then((canvas) => {
              const pngUrl = canvas.toDataURL("image/png")
              const link = document.createElement("a")
              link.href = pngUrl
              link.download = `ticket-${id}.png`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            })
        })
        .catch((err) => {
          console.error("Error generating ticket image:", err)
        })
    }
  }

  /* -------------------------------------------------------------------------- */
  /* ✅ Validate and deactivate ticket (Firestore + Local cache) */
  /* -------------------------------------------------------------------------- */
  const handleValidate = async () => {
    setLoading(true)
    try {
      const ticketRef = doc(db, "tickets", id)
      const ticketSnap = await getDoc(ticketRef)

      if (!ticketSnap.exists()) {
        alert("❌ Invalid ticket data. Ticket not found.")
        setLoading(false)
        return
      }

      const ticketData = ticketSnap.data()
      if (ticketData.used || ticketData.status === "used") {
        alert("⚠️ Ticket has already been used.")
        setIsUsed(true)
        setLoading(false)
        return
      }

      // ✅ Update Firestore
      await updateDoc(ticketRef, {
        used: true,
        status: "used",
        used_at: new Date().toISOString(),
      })

      // ✅ Local cache (for offline prevention)
      const usedQRCodes = JSON.parse(localStorage.getItem("usedQRCodes") || "[]")
      if (!usedQRCodes.includes(id)) {
        usedQRCodes.push(id)
        localStorage.setItem("usedQRCodes", JSON.stringify(usedQRCodes))
      }

      setIsUsed(true)
      alert("✅ Ticket validated and deactivated successfully.")
    } catch (err) {
      console.error("Error validating ticket:", err)
      alert("⚠️ Failed to validate ticket. Try again.")
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 🎟️ Ticket Layout */
  /* -------------------------------------------------------------------------- */
  return (
    <div
      data-ticket-id={id}
      className={`bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg rounded-xl ${
        compact ? "p-3 max-w-xs" : "p-5 max-w-md"
      } mx-auto`}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <SportsSoccer className="h-6 w-6 text-yellow-400" />
        </div>
        <p className="text-gray-200 text-sm">Digital Ticket</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-4" ref={qrRef}>
        <div className="relative">
          {/* Visible QR */}
          <div className="print:hidden">
            <QRCode
              value={qrData}
              size={size}
              level="H"
              includeMargin
              className={`border-2 rounded-lg bg-white ${
                isUsed ? "border-red-500 opacity-50" : "border-white"
              }`}
              data-ticket-id={id}
            />
          </div>

          {/* Printable QR image */}
          {qrImage && (
            <img
              src={qrImage}
              alt="QR Code"
              className={`hidden print:block border-2 rounded-lg bg-white ${
                isUsed ? "border-red-500 opacity-50" : "border-white"
              }`}
              width={size}
              height={size}
            />
          )}
        </div>
      </div>

      {/* Ticket ID */}
      <div className="text-center mb-3">
        <p className="text-xs text-gray-200">Ticket ID</p>
        <p className="font-mono font-semibold text-white text-sm">
          {id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full bg-yellow-400 text-gray-900 py-1.5 rounded-lg text-sm font-semibold mb-3 hover:bg-yellow-300 transition-colors flex items-center justify-center space-x-2"
      >
        <Download fontSize="small" />
        <span>Download Ticket</span>
      </button>

      {/* Validate Button */}
      {!isUsed && (
        <button
          onClick={handleValidate}
          disabled={loading}
          className={`w-full ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-400"
          } text-white py-1.5 rounded-lg text-sm font-semibold mb-4 transition-colors`}
        >
          {loading ? "Validating..." : "Validate & Deactivate Ticket"}
        </button>
      )}

      {/* Ticket Details */}
      {showDetails && match && (
        <div className="border-t border-white/30 pt-4 space-y-2 text-gray-200 text-sm">
          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <SportsSoccer className="h-4 w-4" />
              <span>Match:</span>
            </span>
            <span className="font-semibold text-white text-right">
              {match.home_team} vs {match.away_team}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <CalendarToday className="h-4 w-4" />
              <span>Date:</span>
            </span>
            <span className="font-semibold text-white">
              {formatDate(match.match_date)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <LocationOn className="h-4 w-4" />
              <span>Venue:</span>
            </span>
            <span className="font-semibold text-white">{match.venue}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <EventSeat className="h-4 w-4" />
              <span>Seat:</span>
            </span>
            <span className="font-semibold text-white">{seat_number}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <span>💰</span>
              <span>Price:</span>
            </span>
            <span className="font-semibold text-white">
              {formatCurrency(price)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <Person className="h-4 w-4" />
              <span>Status:</span>
            </span>
            <span
              className={`font-semibold ${
                isUsed ? "text-red-400" : "text-green-400"
              }`}
            >
              {isUsed ? "Used" : "Active"}
            </span>
          </div>

          <div className="mt-3 p-2 bg-white/10 rounded text-[11px] text-gray-200 text-center">
            Present this QR at entrance. Each QR is valid for one-time use only.
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* ✅ Compact Version for List Display */
/* -------------------------------------------------------------------------- */
export const CompactTicketQR = ({ ticket }) => {
  if (!ticket) return null

  const qrData = generateQRData(ticket.id, ticket.match?.id, ticket.seat_number)

  return (
    <div className="flex items-center space-x-3 p-2 bg-white/20 backdrop-blur-lg rounded-lg">
      <QRCode value={qrData} size={64} level="M" data-ticket-id={ticket.id} />
      <div>
        <p className="font-semibold text-sm text-white">{ticket.seat_number}</p>
        <p className="text-xs text-gray-200">
          {ticket.match?.home_team} vs {ticket.match?.away_team}
        </p>
      </div>
    </div>
  )
}

export default TicketQR
