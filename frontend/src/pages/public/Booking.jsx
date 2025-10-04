import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SportsSoccer,
  CalendarToday,
  LocationOn,
  EventSeat,
  ArrowBack,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useMatches, useUserTickets } from '../../hooks/useFirebase';
import SeatMap from '../../components/SeatMap';
import { PageLoader } from '../../components/LoadingSpinner';
import { mpesaService, smsService } from '../../services/api';
import {
  formatDate,
  formatCurrency,
  validatePhoneNumber,
  formatPhoneNumber,
} from '../../utils/helpers';
import { getTeamLogo } from '../../utils/constants';

const Booking = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { matches, loading: matchesLoading, updateMatch } = useMatches();
  const { createTicket, updateTicket, refetch: refetchTickets } = useUserTickets(user?.uid);

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [createdTickets, setCreatedTickets] = useState([]);

  // total amount
  const totalAmount = selectedTickets.reduce(
    (total, ticket) => total + (ticket.price * ticket.quantity),
    0
  );

  const totalSeatsSelected = selectedTickets.reduce(
    (total, ticket) => total + ticket.quantity,
    0
  );

  // Safe conversion for match date (handles Firestore Timestamp)
  const getMatchDate = useCallback((m) => {
    if (!m) return null;
    if (m.match_date && typeof m.match_date === 'object' && typeof m.match_date.toDate === 'function') {
      return m.match_date.toDate();
    }
    if (m.match_date) return new Date(m.match_date);
    return null;
  }, []);

  // ✅ FIXED: Fixed useEffect to prevent infinite loops
  useEffect(() => {
    if (!matchId || !matches || matches.length === 0) {
      if (matches && matches.length === 0 && !loading) {
        setError('Match not found');
        setLoading(false);
      }
      return;
    }

    const foundMatch = matches.find(m => m.id === matchId);
    if (!foundMatch) {
      setError('Match not found');
      setLoading(false);
      return;
    }

    // Only update if match actually changed
    if (!match || match.id !== foundMatch.id) {
      setMatch(foundMatch);
      setLoading(false);
    }
  }, [matchId, matches, loading, match]);

  const handleSeatSelectionChange = useCallback((selection) => {
    setSelectedTickets(selection.tickets || []);
  }, []);

  const handleProceedToPayment = useCallback(() => {
    if (selectedTickets.length === 0 || totalSeatsSelected === 0) {
      alert('Please select at least one ticket');
      return;
    }
    if (match && typeof match.available_seats === 'number' && totalSeatsSelected > match.available_seats) {
      alert(`Only ${match.available_seats} seats available for this match`);
      return;
    }
    setStep(2);
  }, [selectedTickets, totalSeatsSelected, match]);

  // create a small UUID fallback if crypto.randomUUID is not present
  const generateSecret = useCallback(() => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    // fallback - not cryptographically strong but fine for guest_secret if you accept it
    return 'gs_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }, []);

  // Generate sequential seat numbers for selected tickets (e.g., STANDARD1, STANDARD2, VIP1)
  const generateSeatNumbers = useCallback((tickets) => {
    const seatNumbers = [];
    const counters = {}; // counters per type
    tickets.forEach((t) => {
      const typeKey = (t.type || 'standard').toUpperCase();
      if (!counters[typeKey]) counters[typeKey] = 1;
      for (let i = 0; i < t.quantity; i++) {
        const num = counters[typeKey]++;
        seatNumbers.push({
          number: `${typeKey}${num}`,
          type: t.type,
        });
      }
    });
    return seatNumbers;
  }, []);

  const createTickets = useCallback(async () => {
    const tickets = [];
    const normalizedPhone = formatPhoneNumber(phoneNumber);
    const seatAssignments = generateSeatNumbers(selectedTickets);

    for (let i = 0; i < selectedTickets.length; i++) {
      const ticketType = selectedTickets[i];

      for (let j = 0; j < ticketType.quantity; j++) {
        const seatIndex = tickets.length;
        const assigned = seatAssignments[seatIndex] || { number: null, type: ticketType.type };

        const guestSecret = generateSecret();

        const ticketData = {
          match_id: matchId,
          user_id: user?.uid || null, // allow anonymous booking
          user_email: user?.email || 'guest',
          user_name: user?.displayName || 'Guest User',
          user_phone: normalizedPhone,
          seat_type: ticketType.type,
          seat_number: assigned.number,
          price: ticketType.price,
          status: 'pending_payment',
          guest_secret: guestSecret,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // createTicket should return the created ticket including id
        const ticket = await createTicket(ticketData);
        tickets.push(ticket);
      }
    }
    return tickets;
  }, [phoneNumber, selectedTickets, matchId, user, generateSecret, generateSeatNumbers, createTicket]);

  const updateTicketsStatus = useCallback(async (tickets, status, extra = {}) => {
    for (const ticket of tickets) {
      await updateTicket(ticket.id, {
        status,
        updated_at: new Date().toISOString(),
        ...extra,
      });
    }
  }, [updateTicket]);

  const sendConfirmationSMS = useCallback(async (tickets, matchData) => {
    try {
      for (const ticket of tickets) {
        // ensure we have a phone number on the ticket
        if (!ticket.user_phone && !ticket.user_phone_number && !phoneNumber) continue;

        const guestLink = ticket.guest_secret
          ? `${window.location.origin}/tickets/${ticket.id}?guest_secret=${encodeURIComponent(ticket.guest_secret)}`
          : `${window.location.origin}/tickets/${ticket.id}`;

        try {
          // Compose message with direct download/view URL
          const message = matchData
            ? `Your ticket (${ticket.id?.slice(0,8).toUpperCase()}) for ${matchData.home_team} vs ${matchData.away_team} is confirmed.\nSeat: ${ticket.seat_number || 'TBA'}.\nDownload/View ticket: ${guestLink}\nThank you for booking with FootballTickets.`
            : `Your ticket (${ticket.id?.slice(0,8).toUpperCase()}) is confirmed.\nDownload/View ticket: ${guestLink}\nThank you for booking with FootballTickets.`;

          // Send message to server SMS endpoint; server may accept `message` as payload and use it
          const result = await smsService.sendTicketSMS({
            ticket,
            user: {
              id: user?.uid || 'guest',
              email: user?.email || 'guest',
            },
            message, // <-- include explicit message with download URL
          });

          if (result && result.success) {
            await updateTicket(ticket.id, {
              sms_sent: true,
              sms_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else {
            console.warn('SMS sending returned false or no success flag:', result);
          }
        } catch (err) {
          console.error('SMS error:', err);
          // Don't throw — continue with others
        }

        // small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.error('Error in SMS sending process:', err);
      // Don't block booking on SMS failure
    }
  }, [user, updateTicket, phoneNumber]);

  const handlePayment = useCallback(async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      alert('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    if (!match || selectedTickets.length === 0) {
      alert('Please select tickets before proceeding with payment');
      return;
    }

    setProcessing(true);
    setError('');

    let tickets = [];

    try {
      // create tickets first (they will contain guest_secret and seat_number)
      tickets = await createTickets();
      setCreatedTickets(tickets);

      // initiate mpesa payment (STK push)
      const mpesaResp = await mpesaService.initiatePayment({
        phoneNumber: formatPhoneNumber(phoneNumber),
        amount: totalAmount,
        // ✅ IMPORTANT: include matchId so backend can split into [matchId, ticket1, ticket2...]
        accountReference: `${matchId}_${tickets.map(t => t.id).join('_')}`,
        transactionDesc: `Tickets for ${match.home_team} vs ${match.away_team}`,
      });

      if (!mpesaResp.success) throw new Error(mpesaResp.message || 'Payment initiation failed');

      // update tickets with checkout id
      await updateTicketsStatus(tickets, 'pending_payment', {
        mpesa_checkout_request_id: mpesaResp.data.CheckoutRequestID,
      });

      // poll for confirmation (simple loop)
      let confirmed = false;
      let attempts = 0;
      const maxAttempts = 36;

      while (!confirmed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const checkResp = await mpesaService.checkPaymentStatus(mpesaResp.data.CheckoutRequestID);

        if (checkResp.success && checkResp.paymentConfirmed) {
          confirmed = true;
          break;
        } else if (checkResp.status === 'Failed' || checkResp.status === 'Cancelled') {
          throw new Error(`Payment ${checkResp.status.toLowerCase()}`);
        }

        attempts++;
      }

      if (!confirmed) throw new Error('Payment confirmation timeout - please try again');

      // mark tickets confirmed
      await updateTicketsStatus(tickets, 'confirmed', {
        payment_status: 'completed',
        confirmed_at: new Date().toISOString(),
      });

      // update match available seats
      if (typeof match.available_seats === 'number') {
        await updateMatch(matchId, {
          available_seats: Math.max(0, match.available_seats - totalSeatsSelected),
          updated_at: new Date().toISOString(),
        });
      }

      // send SMS confirmations with guest link (message includes download URL)
      await sendConfirmationSMS(tickets, match);

      // refresh user tickets (for logged in users)
      if (user) {
        await refetchTickets();
      }

      setStep(3);
    } catch (err) {
      // mark tickets payment_failed if created
      if (tickets.length > 0) {
        try {
          await updateTicketsStatus(tickets, 'payment_failed', {
            payment_error: err.message,
          });
        } catch (updateErr) {
          console.error('Error updating ticket status to failed:', updateErr);
        }
      }
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [
    phoneNumber, match, selectedTickets, createTickets, totalAmount, 
    updateTicketsStatus, updateMatch, matchId, totalSeatsSelected, 
    sendConfirmationSMS, user, refetchTickets
  ]);

  const handleBackToSeats = useCallback(() => {
    setStep(1);
    setError('');
    setPhoneNumber('');
  }, []);

  if (matchesLoading || loading) return <PageLoader />;

  if (error && !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center">
          <Warning className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button onClick={() => navigate('/matches')} className="bg-[#0B1B32] text-white px-6 py-3 rounded-2xl font-medium">
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const matchDate = getMatchDate(match);

  const steps = [
    { number: 1, label: 'Select Tickets' },
    { number: 2, label: 'Payment' },
    { number: 3, label: 'Confirmation' },
  ];

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-white mb-6 hover:underline">
          <ArrowBack className="h-5 w-5" />
          <span>Back to Matches</span>
        </button>

        {/* Steps indicator */}
        <div className="flex justify-center mb-10">
          {steps.map((stepItem, index) => (
            <React.Fragment key={stepItem.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm ${
                    step >= stepItem.number ? 'bg-[#0B1B32] text-white' : 'bg-white/40 text-[#0B1B32]'
                  }`}
                >
                  {stepItem.number}
                </div>
                <span className="text-white text-sm mt-1">{stepItem.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-20 h-1 rounded-full mt-5 ${step > stepItem.number ? 'bg-[#0B1B32]' : 'bg-white/40'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Match Details */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sticky top-6 border border-white/30">
              <h2 className="text-xl font-bold text-[#0B1B32] mb-4">Match Details</h2>

              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={getTeamLogo(match.home_team)}
                      alt={match.home_team}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm mt-2">{match.home_team}</span>
                </div>

                <span className="font-bold text-lg">VS</span>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={getTeamLogo(match.away_team)}
                      alt={match.away_team}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm mt-2">{match.away_team}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <SportsSoccer className="h-6 w-6 text-[#0B1B32]" />
                  <div className="font-semibold">{match.home_team} vs {match.away_team}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarToday className="h-6 w-6 text-[#0B1B32]" />
                  <div>{matchDate ? formatDate(matchDate) : 'Date not available'}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <LocationOn className="h-6 w-6 text-[#0B1B32]" />
                  <div>{match.venue || 'TBD'}</div>
                </div>

                <div className="border-t border-white/30 pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Base Ticket Price:</span>
                    <span>{formatCurrency(match.ticket_price || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available Seats:</span>
                    <span className={`font-semibold ${ (match.available_seats || 0) < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {match.available_seats ?? 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedTickets.length > 0 && (
                <div className="border-t border-white/30 pt-4 mt-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <EventSeat className="h-5 w-5 mr-2 text-[#0B1B32]" />
                    Selected Tickets ({totalSeatsSelected})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedTickets.map((ticket, index) => (
                      <div key={`${ticket.type}-${index}`} className="flex justify-between text-sm bg-white/50 p-2 rounded-lg">
                        <span>{ticket.quantity} x {ticket.type.toUpperCase()} Ticket{ticket.quantity > 1 ? 's' : ''}</span>
                        <span className="font-medium">{formatCurrency(ticket.price * ticket.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/30 mt-3 pt-3 font-semibold flex justify-between text-lg">
                    <span>Total:</span>
                    <span className="text-[#0B1B32]">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Flow */}
          <div className="lg:col-span-2 space-y-8">
            {step === 1 && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-[#0B1B32]">Select Your Tickets</h2>
                {match.available_seats === 0 && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
                    Sold Out! No available seats for this match.
                  </div>
                )}
                <SeatMap
                  match={match}
                  onSelectionChange={handleSeatSelectionChange}
                  initialSelection={selectedTickets.reduce((acc, ticket) => {
                    acc[ticket.type] = ticket.quantity;
                    return acc;
                  }, {})}
                />
                {selectedTickets.length > 0 && (
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-[#0B1B32]">
                      {totalSeatsSelected} ticket(s) selected • {formatCurrency(totalAmount)}
                    </div>
                    <button
                      onClick={handleProceedToPayment}
                      className="bg-[#0B1B32] text-white px-8 py-3 rounded-2xl font-medium hover:opacity-90 shadow-lg transition"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-[#0B1B32]">Payment Details</h2>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                    <Warning className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}
                <div className="space-y-6">
                  <div className="bg-[#EBF0F6] rounded-2xl p-5 border border-[#0B1B32]/20">
                    <h3 className="font-semibold mb-3 text-lg text-[#0B1B32]">Order Summary</h3>
                    {selectedTickets.map((ticket, index) => (
                      <div key={`${ticket.type}-${index}`} className="flex justify-between text-sm mb-2">
                        <span>{ticket.quantity} x {ticket.type.toUpperCase()} Ticket{ticket.quantity > 1 ? 's' : ''}</span>
                        <span>{formatCurrency(ticket.price * ticket.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-[#0B1B32]/20 mt-3 pt-3 font-semibold flex justify-between text-lg">
                      <span>Total Amount:</span>
                      <span className="text-[#0B1B32]">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#0B1B32]">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={processing}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1B32] focus:border-transparent"
                    />
                    <p className="text-sm mt-1 text-gray-600">
                      Enter your M-Pesa registered phone number. We'll send payment request via STK Push.
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleBackToSeats}
                      disabled={processing}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-2xl font-medium disabled:opacity-50 hover:bg-gray-600 transition"
                    >
                      Back to Tickets
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={processing || !phoneNumber}
                      className="flex-1 bg-[#0B1B32] text-white py-3 rounded-2xl font-medium disabled:opacity-50 hover:opacity-90 transition"
                    >
                      {processing ? 'Processing Payment...' : `Pay ${formatCurrency(totalAmount)}`}
                    </button>
                  </div>

                  {processing && (
                    <div className="text-center text-[#0B1B32]">
                      <p>Please check your phone for M-Pesa prompt...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/30 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-[#0B1B32]">Payment Successful!</h2>
                <p className="text-gray-700 mb-6 text-lg">
                  Your tickets have been booked successfully!
                  {createdTickets.some(t => t.sms_sent) ? (
                    <span className="text-green-600 font-semibold"> SMS confirmation has been sent to your phone.</span>
                  ) : (
                    <span> You can view and download your tickets below.</span>
                  )}
                </p>
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm">
                    <strong>Booking Details:</strong> {totalSeatsSelected} ticket(s) for {match.home_team} vs {match.away_team}
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    <strong>Total Paid:</strong> {formatCurrency(totalAmount)}
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    <strong>Tickets:</strong> {selectedTickets.map(t => `${t.quantity} ${t.type.toUpperCase()}`).join(', ')}
                  </p>
                </div>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => navigate('/matches')}
                    className="bg-gray-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-gray-600 transition"
                  >
                    Book More Tickets
                  </button>
                  <button
                    onClick={() => navigate(user ? '/my-tickets' : '/')}
                    className="bg-[#0B1B32] text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90 transition"
                  >
                    {user ? 'View My Tickets' : 'Return Home'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
