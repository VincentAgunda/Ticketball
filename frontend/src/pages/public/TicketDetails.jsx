import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import TicketQR from "../../components/TicketQR";
import { PageLoader } from "../../components/LoadingSpinner";
import {
  CalendarToday,
  LocationOn,
  EventSeat,
  ConfirmationNumber,
  Print,
  ArrowBack,
} from "@mui/icons-material";
import { formatDate, formatCurrency } from "../../utils/helpers";
import { getTeamLogo } from "../../utils/constants";

const TicketDetails = () => {
  const { ticketId } = useParams();
  const [searchParams] = useSearchParams();
  const guestSecret = searchParams.get("guest_secret");

  const [ticket, setTicket] = useState(null);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketRef = doc(db, "tickets", ticketId);
        const ticketSnap = await getDoc(ticketRef);

        if (!ticketSnap.exists()) {
          setError("Ticket not found.");
          setLoading(false);
          return;
        }

        const ticketData = ticketSnap.data();
        if (ticketData.guest) {
          if (!guestSecret || guestSecret !== ticketData.guest_secret) {
            setError("Invalid or unauthorized guest link.");
            setLoading(false);
            return;
          }
        }

        setTicket({ id: ticketSnap.id, ...ticketData });
        if (ticketData.match_id) {
          const matchRef = doc(db, "matches", ticketData.match_id);
          const matchSnap = await getDoc(matchRef);
          if (matchSnap.exists()) {
            setMatch({ id: matchSnap.id, ...matchSnap.data() });
          }
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError("Failed to load ticket.");
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchData();
  }, [ticketId, guestSecret]);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] text-[#004700] px-6 text-center">
        <h1 className="text-2xl font-semibold mb-2 text-[#00008B]">Error</h1>
        <p>{error}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00008B] text-white font-semibold hover:bg-[#004700] transition-all"
        >
          <ArrowBack className="!text-white" />
          Back to Homepage
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] text-[#004700]">
        Ticket not found.
      </div>
    );
  }

  const combinedMatch = match || {
    home_team: ticket.home_team || "Unknown Team",
    away_team: ticket.away_team || "Unknown Team",
    match_date: ticket.match_date || ticket.created_at,
    venue: ticket.venue || "Unknown Venue",
  };

  const formattedDate = combinedMatch.match_date
    ? formatDate(combinedMatch.match_date)
    : "TBA";

  const seatLabel =
    ticket.seat_number ||
    ticket.seat ||
    ticket.category?.toUpperCase() ||
    "STANDARD";

  const amountValue =
    ticket.amount && !isNaN(Number(ticket.amount))
      ? formatCurrency(Number(ticket.amount))
      : "KES 0";

  const printTicketOnly = () => {
    const ticketEl = document.getElementById("ticket-section");
    if (!ticketEl) return window.print();

    const styles = Array.from(document.querySelectorAll("link, style"))
      .map((s) => s.outerHTML)
      .join("\n");

    const newWin = window.open("", "_blank");
    newWin.document.write(`
      <html>
        <head>
          <title>Print Ticket</title>
          ${styles}
          <style>
            body { background: white; -webkit-print-color-adjust: exact; margin: 0; }
            #ticket-section { box-shadow: none; border: none; width: 260px; padding: 8px; margin: 0 auto; background: white; }
            @page { margin: 8mm; }
          </style>
        </head>
        <body>${ticketEl.outerHTML}</body>
      </html>
    `);
    newWin.document.close();
    newWin.focus();
    setTimeout(() => {
      newWin.print();
      newWin.close();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center py-10 px-4 print:bg-white">
      <div
        className="max-w-md w-full bg-[#F5F5F7] rounded-2xl shadow-lg p-6 border border-[#00008B]/20"
        id="ticket-section"
      >
        <h1 className="text-2xl font-bold text-[#00008B] text-center mb-5">
          Ticket Details
        </h1>

        {/* Teams */}
        <div className="flex justify-between items-center mb-6 relative">
          {[combinedMatch.home_team, combinedMatch.away_team].map((team, idx) => (
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
            { icon: <CalendarToday />, label: formattedDate },
            { icon: <LocationOn />, label: combinedMatch.venue },
            { icon: <EventSeat />, label: seatLabel },
            { icon: <ConfirmationNumber />, label: amountValue },
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

        {/* Print */}
        <div className="mt-6 text-center print:hidden">
          <button
            onClick={printTicketOnly}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00008B] text-white text-sm font-semibold rounded-full shadow-md hover:bg-[#004700] transition-all"
          >
            <Print fontSize="small" />
            Print Ticket
          </button>
        </div>

        <p className="text-xs text-[#004700] mt-4 text-center">
          Ticket ID: {ticket.id.slice(0, 10).toUpperCase()}
        </p>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #ticket-section, #ticket-section * { visibility: visible !important; }
          #ticket-section {
            position: absolute !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            top: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 260px !important;
            padding: 8px !important;
            background: white !important;
          }
          button, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default TicketDetails;
