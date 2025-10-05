import React, { useState, useEffect, useCallback, useRef } from "react";
import QrScanner from "qr-scanner";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Error as ErrorIcon, SportsSoccer, ConfirmationNumber } from "@mui/icons-material";

/* Robust base64 decode (returns null if not valid base64) */
function tryBase64Decode(str) {
  try {
    // quick regex-ish check (not perfect) to avoid throwing wherever possible
    if (!/^[A-Za-z0-9+/=]+$/.test(str)) return null;
    const binary = atob(str);
    // convert binary string to UTF-8 properly
    try {
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const decoded = new TextDecoder().decode(bytes);
      return decoded;
    } catch {
      // fallback to binary string
      return binary;
    }
  } catch {
    return null;
  }
}

/* Parse QR data from JSON, Base64, or pipe-separated formats */
function parseQRData(qrString) {
  if (!qrString || typeof qrString !== "string") return null;
  console.log("Raw QR data received:", qrString);

  // 1) JSON (developer/testing)
  try {
    const json = JSON.parse(qrString);
    // allow ticketId or ticket_id variants
    const ticketId = json.ticketId || json.ticket_id;
    const matchId = json.matchId || json.match_id;
    const seatNumber = json.seatNumber || json.seat_number;
    if (ticketId && matchId && seatNumber) {
      return { ticketId, matchId, seatNumber };
    }
  } catch {
    // not JSON
  }

  // 2) Base64 (preferred)
  const decoded = tryBase64Decode(qrString);
  if (decoded) {
    const parts = decoded.split("|");
    if (parts.length >= 3) {
      const [ticketId, matchId, seatNumber] = parts;
      if (ticketId && matchId && seatNumber) return { ticketId, matchId, seatNumber };
    }
  }

  // 3) Plain pipe-separated
  if (qrString.includes("|")) {
    const parts = qrString.split("|");
    if (parts.length >= 3) {
      const [ticketId, matchId, seatNumber] = parts;
      if (ticketId && matchId && seatNumber) return { ticketId, matchId, seatNumber };
    }
  }

  // nothing matched
  console.warn("Could not parse QR data:", qrString);
  return null;
}

const TicketScanner = () => {
  const [scans, setScans] = useState([]); // last scans
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [cameraReady, setCameraReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const recentlyScanned = useRef(new Set());

  /* Beep & Vibrate */
  const playSuccess = useCallback(() => {
    // Try audio file first
    const audio = new Audio("/success-beep.mp3");
    audio.play().catch(() => {
      // fallback to oscillator if file unavailable
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(880, ctx.currentTime);
        g.gain.setValueAtTime(0.02, ctx.currentTime);
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.12);
      } catch {
        // ignore
      }
    });
    if (navigator.vibrate) navigator.vibrate(120);
  }, []);

  /* Handle one scan */
  const handleScan = useCallback(
    async (raw) => {
      if (!raw || loading) return;
      // raw may be result object from QrScanner or string — accept both
      const dataString = typeof raw === "string" ? raw : raw?.data || raw?.raw || "";
      console.log("🔄 Processing QR scan:", dataString);
      const parsed = parseQRData(dataString);

      if (!parsed?.ticketId) {
        setStatus("error");
        setMessage("❌ Invalid QR code format - cannot parse data");
        return;
      }

      const { ticketId, matchId, seatNumber } = parsed;

      // prevent duplicate reads for a short window
      if (recentlyScanned.current.has(ticketId)) {
        console.log("⏭️ Duplicate scan skipped:", ticketId);
        return;
      }
      recentlyScanned.current.add(ticketId);
      setTimeout(() => recentlyScanned.current.delete(ticketId), 4000);

      setLoading(true);
      setMessage("");
      setStatus(null);

      try {
        const ticketRef = doc(db, "tickets", ticketId);
        const snapshot = await getDoc(ticketRef);

        if (!snapshot.exists()) {
          setStatus("error");
          setMessage("❌ Ticket not found in database");
          setScans((prev) => [
            { ticketId, status: "invalid", seat: seatNumber || "N/A", match: { home_team: "Unknown", away_team: "Unknown" } },
            ...prev.slice(0, 9),
          ]);
          setLoading(false);
          return;
        }

        const ticket = snapshot.data();

        if (ticket.used || ticket.status === "used") {
          setStatus("error");
          setMessage(`⚠️ Ticket ${ticketId} already used`);
          setScans((prev) => [
            {
              ticketId,
              status: "used",
              seat: ticket.seat_number || seatNumber || "N/A",
              match: ticket.match || { home_team: "Unknown", away_team: "Unknown" },
            },
            ...prev.slice(0, 9),
          ]);
          playSuccess();
          setLoading(false);
          return;
        }

        // Mark used
        await updateDoc(ticketRef, {
          used: true,
          status: "used",
          used_at: new Date().toISOString(),
        });

        setStatus("success");
        setMessage("✅ Ticket validated successfully");
        setScans((prev) => [
          {
            ticketId,
            status: "valid",
            seat: ticket.seat_number || seatNumber || "N/A",
            match: ticket.match || { home_team: "Unknown", away_team: "Unknown" },
          },
          ...prev.slice(0, 9),
        ]);

        // local cache
        try {
          const usedQRCodes = JSON.parse(localStorage.getItem("usedQRCodes") || "[]");
          if (!usedQRCodes.includes(ticketId)) {
            usedQRCodes.push(ticketId);
            localStorage.setItem("usedQRCodes", JSON.stringify(usedQRCodes));
          }
        } catch {
          // ignore localStorage errors
        }

        playSuccess();
      } catch (err) {
        console.error("Validation error:", err);
        setStatus("error");
        setMessage("⚠️ Error validating ticket - please try again");
      } finally {
        setLoading(false);
      }
    },
    [loading, playSuccess]
  );

  /* Initialize scanner */
  useEffect(() => {
    const videoElem = videoRef.current;
    if (!videoElem) return;

    let mounted = true;

    const initScanner = async () => {
      try {
        // hint: create a canvas with willReadFrequently to reduce console warnings in Chrome
        try {
          const tmp = document.createElement("canvas");
          tmp.getContext("2d", { willReadFrequently: true });
        } catch {
          // ignore if not supported
        }

        const cams = await QrScanner.listCameras();
        if (!mounted) return;
        if (cams.length === 0) throw new Error("No cameras found");

        const scanner = new QrScanner(
          videoElem,
          (result) => {
            // QrScanner returns either result.data (string) or result (string depending on options)
            const payload = result?.data ?? result;
            handleScan(payload);
          },
          {
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 2,
            returnDetailedScanResult: true,
          }
        );

        scannerRef.current = scanner;
        await scanner.start();
        if (!mounted) return;
        setCameraReady(true);
        console.log("✅ Camera started successfully");
      } catch (err) {
        console.error("Camera Error:", err);
        setStatus("error");
        setMessage(
          err?.message?.includes("permission")
            ? "⚠️ Camera access denied. Please allow camera permissions and refresh."
            : "⚠️ Camera unavailable. Please check if your device has a camera and try again."
        );
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
        console.log("🧹 Camera cleaned up");
      }
    };
  }, [handleScan]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center p-6 font-sans relative">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 flex items-center space-x-3">
        <SportsSoccer className="text-yellow-400" />
        <span>Continuous Ticket Scanner</span>
      </h1>

      {/* Camera Box */}
      <div className="w-full max-w-sm bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 relative">
        <video ref={videoRef} className={`w-full h-80 object-cover transition-opacity duration-700 ${cameraReady ? "opacity-100" : "opacity-0"}`} muted playsInline />

        {/* Scanner overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-yellow-400 rounded-lg opacity-80">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-yellow-400"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-yellow-400"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-yellow-400"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-yellow-400"></div>
          </div>
        </div>

        {!cameraReady && !message && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
            <p className="text-gray-300 text-lg italic animate-pulse">Initializing Camera...</p>
            <p className="text-gray-500 text-sm mt-2">Please allow camera access</p>
          </div>
        )}
      </div>

      {/* Status message */}
      <div className="mt-4 w-full max-w-sm h-36 flex items-center justify-center">
        <AnimatePresence>
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mb-2"></div>
              <p className="text-gray-300 text-lg">Validating ticket...</p>
            </motion.div>
          )}

          {!loading && status === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-3 w-full bg-green-600/20 border border-green-600/50 rounded-lg text-center">
              <CheckCircle className="text-green-400 mx-auto mb-1" style={{ fontSize: 40 }} />
              <p className="font-semibold text-lg">{message}</p>
            </motion.div>
          )}

          {!loading && status === "error" && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-3 w-full bg-red-600/20 border border-red-500/50 rounded-lg text-center">
              <ErrorIcon className="text-red-400 mx-auto mb-1" style={{ fontSize: 40 }} />
              <p className="font-semibold text-lg">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scanned Results History */}
      <div className="mt-6 w-full max-w-sm bg-gray-800/60 rounded-lg border border-gray-700 shadow-inner overflow-hidden">
        <div className="bg-gray-700/60 px-4 py-2 text-sm font-semibold flex justify-between items-center">
          <span>Recent Scans</span>
          <span className="text-xs text-gray-300 bg-gray-600 px-2 py-1 rounded">{scans.length}</span>
        </div>
        <div className="max-h-60 overflow-y-auto divide-y divide-gray-700">
          {scans.length === 0 ? (
            <p className="text-gray-500 text-center py-6 italic">No scans yet. Point camera at a ticket QR code.</p>
          ) : (
            scans.map((scan, index) => (
              <div key={`${scan.ticketId}-${index}`} className="flex justify-between items-center px-4 py-3 text-sm hover:bg-gray-700/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-200 truncate">{scan.match?.home_team} vs {scan.match?.away_team}</p>
                  <p className="text-gray-400 text-xs">Seat: {scan.seat || "N/A"} | ID: {scan.ticketId.slice(0, 8)}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ml-2 ${scan.status === "valid" ? "bg-green-500/30 text-green-300" : scan.status === "used" ? "bg-yellow-500/30 text-yellow-300" : "bg-red-500/30 text-red-300"}`}>{scan.status.toUpperCase()}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-xs text-gray-400 max-w-sm">
        <p>Point camera at ticket QR code. Scanner works automatically.</p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-gray-500 text-center">
        <ConfirmationNumber className="h-4 w-4 inline mr-1" />
        Continuous QR Ticket Validation — Real-Time Scanning Active
      </div>
    </div>
  );
};

export default TicketScanner;
