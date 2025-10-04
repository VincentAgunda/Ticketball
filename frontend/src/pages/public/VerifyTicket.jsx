import React, { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { db } from "../../lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { CheckCircle, ErrorOutline, Home } from "@mui/icons-material"

const VerifyTicket = () => {
  const [searchParams] = useSearchParams()
  const ticketId = searchParams.get("ticket_id")
  const [status, setStatus] = useState("loading")
  const [ticket, setTicket] = useState(null)

  useEffect(() => {
    const verifyTicket = async () => {
      if (!ticketId) {
        setStatus("invalid")
        return
      }

      try {
        const ticketRef = doc(db, "tickets", ticketId)
        const ticketSnap = await getDoc(ticketRef)

        if (!ticketSnap.exists()) {
          setStatus("invalid")
          return
        }

        const data = ticketSnap.data()
        setTicket({ id: ticketSnap.id, ...data })

        if (data.used) {
          setStatus("used")
          return
        }

        // ✅ Mark as used immediately
        await updateDoc(ticketRef, {
          used: true,
          used_at: new Date().toISOString(),
        })

        setStatus("valid")
      } catch (err) {
        console.error("Verification failed:", err)
        setStatus("error")
      }
    }

    verifyTicket()
  }, [ticketId])

  const statusUI = {
    loading: (
      <p className="text-lg text-gray-500 animate-pulse">Verifying ticket...</p>
    ),
    valid: (
      <div className="text-center space-y-3">
        <CheckCircle className="text-green-500 !text-5xl mx-auto" />
        <p className="text-lg font-semibold text-green-700">
          ✅ Ticket verified successfully!
        </p>
        <p className="text-sm text-gray-600">
          Ticket ID: {ticket?.id.slice(0, 8).toUpperCase()}
        </p>
        <p className="text-xs text-gray-400">
          Marked as used at: {new Date().toLocaleString()}
        </p>
      </div>
    ),
    used: (
      <div className="text-center space-y-3">
        <ErrorOutline className="text-yellow-500 !text-5xl mx-auto" />
        <p className="text-lg font-semibold text-yellow-600">
          ⚠️ Ticket already used!
        </p>
        <p className="text-sm text-gray-600">
          Ticket ID: {ticket?.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
    ),
    invalid: (
      <div className="text-center space-y-3">
        <ErrorOutline className="text-red-500 !text-5xl mx-auto" />
        <p className="text-lg font-semibold text-red-700">❌ Invalid Ticket</p>
        <p className="text-sm text-gray-600">
          This QR code does not correspond to any active ticket.
        </p>
      </div>
    ),
    error: (
      <div className="text-center space-y-3">
        <ErrorOutline className="text-red-500 !text-5xl mx-auto" />
        <p className="text-lg font-semibold text-red-700">
          ⚠️ Error verifying ticket
        </p>
      </div>
    ),
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] text-[#004700] px-6 text-center">
      {statusUI[status]}

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00008B] text-white font-semibold hover:bg-[#004700] transition-all"
      >
        <Home fontSize="small" />
        Back Home
      </Link>
    </div>
  )
}

export default VerifyTicket
