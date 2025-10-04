import React, { useState, useEffect, useCallback, useRef } from "react"
import QrScanner from "react-qr-scanner"
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore"
import { db } from "../lib/firebase"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  Error as ErrorIcon,
  Replay,
  SportsSoccer,
  ConfirmationNumber,
} from "@mui/icons-material"

/* -------------------------------------------------------------------------- */
/* 🔍 Utility: Decode QR Data                                                 */
/* -------------------------------------------------------------------------- */
function parseQRData(qrString) {
  try {
    const decoded = atob(qrString)
    const [ticketId, matchId, seat] = decoded.split("|")
    return { ticketId, matchId, seat }
  } catch (err) {
    console.error("QR Parse Error:", err)
    return null
  }
}

/* -------------------------------------------------------------------------- */
/* 🎫 Main Ticket Scanner Component                                           */
/* -------------------------------------------------------------------------- */
const TicketScanner = () => {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ticketData, setTicketData] = useState(null)
  const [liveStatus, setLiveStatus] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const hasScanned = useRef(false)

  /* -------------------------------------------------------------------------- */
  /* 🔄 Reset Scanner */
  /* -------------------------------------------------------------------------- */
  const resetScanner = useCallback(() => {
    setResult(null)
    setError(null)
    setTicketData(null)
    setLiveStatus(null)
    setLoading(false)
    hasScanned.current = false
  }, [])

  /* -------------------------------------------------------------------------- */
  /* 🧠 Handle Scanned Data                                                    */
  /* -------------------------------------------------------------------------- */
  const handleScan = useCallback(
    async (data) => {
      if (!data || loading || hasScanned.current) return
      hasScanned.current = true
      setLoading(true)
      setResult(null)
      setError(null)

      try {
        const parsed = parseQRData(data.text || data)
        if (!parsed?.ticketId) {
          setError("❌ Invalid QR code format")
          setLoading(false)
          return
        }

        const { ticketId } = parsed
        const ticketRef = doc(db, "tickets", ticketId)
        const snapshot = await getDoc(ticketRef)

        if (!snapshot.exists()) {
          setError("❌ Ticket not found in database")
          setLoading(false)
          return
        }

        const ticket = snapshot.data()
        setTicketData(ticket)

        if (ticket.used || ticket.status === "used") {
          setError("⚠️ Ticket already used")
          setLoading(false)
          return
        }

        // ✅ Automatically deactivate ticket
        await updateDoc(ticketRef, {
          used: true,
          status: "used",
          used_at: new Date().toISOString(),
        })

        // 🔁 Live status listener
        const unsubscribe = onSnapshot(ticketRef, (snap) => {
          if (snap.exists()) {
            setLiveStatus(snap.data().status)
          }
        })

        setResult("✅ Ticket validated successfully")
        setLoading(false)

        // 🕒 Automatically reset scanner after 4 seconds
        setTimeout(() => {
          unsubscribe()
          resetScanner()
        }, 4000)
      } catch (err) {
        console.error("Error validating ticket:", err)
        setError("⚠️ Error validating ticket")
        setLoading(false)
      }
    },
    [loading, resetScanner]
  )

  const handleError = (err) => {
    console.error("QR Reader Error:", err)
    setError("⚠️ Camera access denied or unavailable")
  }

  /* -------------------------------------------------------------------------- */
  /* 📸 Camera Access Check                                                    */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setCameraReady(true))
      .catch(() =>
        setError("⚠️ Camera access is required for ticket scanning.")
      )
  }, [])

  /* -------------------------------------------------------------------------- */
  /* 🖼️ UI Layout                                                             */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <SportsSoccer className="text-yellow-400" />
        <span>Ticket Scanner</span>
      </h1>

      {/* QR Scanner */}
      {cameraReady ? (
        <div className="w-full max-w-sm bg-white/10 rounded-xl overflow-hidden shadow-lg border border-white/20">
          <QrScanner
            delay={500}
            onError={handleError}
            onScan={handleScan}
            style={{ width: "100%", height: 320 }}
            constraints={{ facingMode: "environment" }}
          />
        </div>
      ) : (
        <p className="text-gray-400 text-sm italic">Initializing camera...</p>
      )}

      {/* Loading State */}
      {loading && (
        <p className="mt-4 text-gray-300 text-sm animate-pulse">
          Validating ticket...
        </p>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !error && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center max-w-sm"
          >
            <CheckCircle className="text-green-400 mb-2" />
            <p className="font-semibold">{result}</p>
            {ticketData && (
              <div className="mt-2 text-sm text-gray-200">
                <p>
                  Seat:{" "}
                  <span className="font-bold">
                    {ticketData.seat_number || "N/A"}
                  </span>
                </p>
                <p>
                  Match:{" "}
                  <span className="font-bold">
                    {ticketData.match?.home_team} vs{" "}
                    {ticketData.match?.away_team}
                  </span>
                </p>
                <p>Status: {liveStatus || "used"}</p>
              </div>
            )}
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center max-w-sm"
          >
            <ErrorIcon className="text-red-400 mb-2" />
            <p className="font-semibold">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-10 text-xs text-gray-400 text-center">
        <ConfirmationNumber className="h-4 w-4 inline mr-1" />
        Secure QR Ticket Validation — Continuous Scan Mode
      </div>
    </div>
  )
}

export default TicketScanner
