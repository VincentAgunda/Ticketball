// src/pages/public/TicketDetails.jsx
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

        // ✅ Guest link validation
        if (ticketData.guest) {
          if (!guestSecret || guestSecret !== ticketData.guest_secret) {
            setError("Invalid or unauthorized guest link.");
            setLoading(false);
            return;
          }
        }

        setTicket({ id: ticketSnap.id, ...ticketData });

        // ✅ Fetch match details if available
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Error</h1>
        <p className="text-gray-400">{error}</p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-all"
        >
          Back to Homepage
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Ticket not found.
      </div>
    );
  }

  // ✅ Merge data
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white flex flex-col items-center py-14 px-6">
      <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center border border-gray-700">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">
          🎟 Ticket Details
        </h1>

        {/* Teams */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
              <img
                src={getTeamLogo(combinedMatch.home_team)}
                alt={combinedMatch.home_team}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-2 text-white font-semibold text-sm">
              {combinedMatch.home_team}
            </p>
          </div>

          <p className="text-gray-400 font-semibold text-lg">vs</p>

          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
              <img
                src={getTeamLogo(combinedMatch.away_team)}
                alt={combinedMatch.away_team}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-2 text-white font-semibold text-sm">
              {combinedMatch.away_team}
            </p>
          </div>
        </div>

        {/* QR */}
        <div className="flex justify-center my-6">
          <TicketQR ticket={ticket} size={180} />
        </div>

        {/* Ticket info */}
        <div className="space-y-3 text-left text-sm">
          <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
            <CalendarToday className="h-5 w-5 text-yellow-400" />
            <p>{formattedDate}</p>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
            <LocationOn className="h-5 w-5 text-yellow-400" />
            <p>{combinedMatch.venue}</p>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
            <EventSeat className="h-5 w-5 text-yellow-400" />
            <p>{seatLabel}</p>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-black/30 rounded">
            <ConfirmationNumber className="h-5 w-5 text-yellow-400" />
            <p>{amountValue}</p>
          </div>
        </div>

        {/* Download */}
        <div className="mt-8">
          <a
            href={`/download/${ticket.id}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 text-black font-semibold rounded-full shadow-lg hover:bg-yellow-400 transition-all"
          >
            Download Ticket
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Ticket ID: {ticket.id.slice(0, 10).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default TicketDetails;
