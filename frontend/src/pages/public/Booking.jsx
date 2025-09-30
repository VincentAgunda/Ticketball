import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  SportsSoccer, 
  CalendarToday, 
  LocationOn, 
  EventSeat, 
  ArrowBack, 
  Warning, 
  CheckCircle 
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
  calculateTicketPrice 
} from '../../utils/helpers';

const Booking = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { matches, loading: matchesLoading, updateMatch } = useMatches();
  const { createTicket, updateTicket, tickets: userTickets, refetch: refetchTickets } = useUserTickets(user?.uid);

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [createdTickets, setCreatedTickets] = useState([]);

  const totalAmount = selectedSeats.reduce(
    (total, seat) => total + calculateTicketPrice(match?.ticket_price || 0, seat.type), 
    0
  );

  useEffect(() => {
    if (!matchId || matches.length === 0) return;

    const foundMatch = matches.find(m => m.id === matchId);
    if (!foundMatch) {
      setError('Match not found');
      setLoading(false);
      return;
    }

    setMatch(foundMatch);
    
    const matchBookedSeats = userTickets
      .filter(ticket => ticket.match_id === matchId && ticket.status !== 'cancelled')
      .map(ticket => ticket.seat_number);
    
    setBookedSeats(matchBookedSeats);
    setLoading(false);
  }, [matchId, matches, userTickets]);

  const handleSeatSelect = (seat) => {
    setSelectedSeats(prev => {
      if (prev.some(s => s.number === seat.number)) {
        return prev.filter(s => s.number !== seat.number);
      }
      if (match && prev.length >= match.available_seats) {
        alert(`You can only book up to ${match.available_seats} seats`);
        return prev;
      }
      if (bookedSeats.includes(seat.number)) {
        alert('This seat is already booked');
        return prev;
      }
      return [...prev, seat];
    });
  };

  const handleProceedToPayment = () => {
    if (!user) {
      navigate('/login', { state: { from: `/booking/${matchId}` } });
      return;
    }
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    setStep(2);
  };

  const createTickets = async () => {
    const tickets = [];
    const normalizedPhone = formatPhoneNumber(phoneNumber);
    
    for (const seat of selectedSeats) {
      const ticketData = {
        match_id: matchId,
        user_id: user.uid,
        user_email: user.email,
        user_name: user.displayName || user.email,
        user_phone: normalizedPhone,
        seat_number: seat.number,
        seat_type: seat.type,
        price: calculateTicketPrice(match.ticket_price, seat.type),
        status: 'pending_payment',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const ticket = await createTicket(ticketData);
      tickets.push(ticket);
    }
    return tickets;
  };

  const updateTicketsStatus = async (tickets, status, extra = {}) => {
    for (const ticket of tickets) {
      await updateTicket(ticket.id, { 
        status, 
        updated_at: new Date().toISOString(), 
        ...extra 
      });
    }
  };

  const sendConfirmationSMS = async (tickets, matchData) => {
    try {
      let smsSentCount = 0;
      
      for (const ticket of tickets) {
        try {
          if (!ticket.user_phone) continue;

          const ticketWithMatch = {
            ...ticket,
            match: matchData
          };

          const result = await smsService.sendTicketSMS(ticketWithMatch, {
            id: user.uid,
            email: user.email,
            phoneNumber: ticket.user_phone
          });
          
          if (result.success) {
            smsSentCount++;
            await updateTicket(ticket.id, {
              sms_sent: true,
              sms_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        } catch (smsError) {
          console.error('SMS error for ticket:', ticket.id, smsError);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      return smsSentCount;
    } catch (err) {
      console.error('Error in SMS sending process:', err);
      return 0;
    }
  };

  const handlePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      alert('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }
    
    if (!match || selectedSeats.length === 0) {
      alert('Please select seats before proceeding with payment');
      return;
    }

    setProcessing(true);
    setError('');
    
    let tickets = [];
    
    try {
      tickets = await createTickets();
      setCreatedTickets(tickets);

      const mpesaResp = await mpesaService.initiatePayment({
        phoneNumber: formatPhoneNumber(phoneNumber), 
        amount: totalAmount,
        accountReference: `TICKET_${tickets.map(t => t.id).join('_')}`,
        transactionDesc: `Tickets for ${match.home_team} vs ${match.away_team}`
      });

      if (!mpesaResp.success) {
        throw new Error(mpesaResp.message || 'Payment initiation failed');
      }

      await updateTicketsStatus(tickets, 'pending_payment', { 
        mpesa_checkout_request_id: mpesaResp.data.CheckoutRequestID 
      });

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

      if (!confirmed) {
        throw new Error('Payment confirmation timeout - please try again');
      }

      await updateTicketsStatus(tickets, 'confirmed', { 
        payment_status: 'completed',
        confirmed_at: new Date().toISOString()
      });
      
      await updateMatch(matchId, { 
        available_seats: Math.max(0, match.available_seats - selectedSeats.length), 
        updated_at: new Date().toISOString() 
      });

      await sendConfirmationSMS(tickets, match);
      await refetchTickets();
      setStep(3);

    } catch (err) {
      if (tickets.length > 0) {
        try {
          await updateTicketsStatus(tickets, 'payment_failed', {
            payment_error: err.message
          });
        } catch (updateErr) {
          console.error('Error updating ticket status to failed:', updateErr);
        }
      }
      
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBackToSeats = () => {
    setStep(1);
    setError('');
    setPhoneNumber('');
  };

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
  
  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center">
          <Warning className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Match Not Found</h2>
          <p className="text-gray-700 mb-6">The match you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/matches')} className="bg-[#0B1B32] text-white px-6 py-3 rounded-2xl font-medium">
            Browse Matches
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, label: 'Select Seats' },
    { number: 2, label: 'Payment' },
    { number: 3, label: 'Confirmation' }
  ];

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center space-x-2 text-white mb-6 hover:underline"
        >
          <ArrowBack className="h-5 w-5" />
          <span>Back to Matches</span>
        </button>

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
                <div 
                  className={`w-20 h-1 rounded-full mt-5 ${step > stepItem.number ? 'bg-[#0B1B32]' : 'bg-white/40'}`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sticky top-6 border border-white/30">
              <h2 className="text-xl font-bold text-[#0B1B32] mb-4">Match Details</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <SportsSoccer className="h-6 w-6 text-[#0B1B32]" />
                  <div className="font-semibold">{match.home_team} vs {match.away_team}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarToday className="h-6 w-6 text-[#0B1B32]" />
                  <div>{formatDate(match.match_date)}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <LocationOn className="h-6 w-6 text-[#0B1B32]" />
                  <div>{match.venue}</div>
                </div>
                <div className="border-t border-white/30 pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Base Ticket Price:</span>
                    <span>{formatCurrency(match.ticket_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available Seats:</span>
                    <span className={`font-semibold ${match.available_seats < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {match.available_seats}
                    </span>
                  </div>
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div className="border-t border-white/30 pt-4 mt-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <EventSeat className="h-5 w-5 mr-2 text-[#0B1B32]" />
                    Selected Seats ({selectedSeats.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedSeats.map((seat) => (
                      <div key={seat.number} className="flex justify-between text-sm bg-white/50 p-2 rounded-lg">
                        <span>Seat {seat.number} ({seat.type})</span>
                        <span className="font-medium">
                          {formatCurrency(calculateTicketPrice(match.ticket_price, seat.type))}
                        </span>
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

          <div className="lg:col-span-2 space-y-8">
            {step === 1 && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/30">
                <h2 className="text-2xl font-bold mb-6 text-[#0B1B32]">Select Your Seats</h2>
                {match.available_seats === 0 && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
                    Sold Out! No available seats for this match.
                  </div>
                )}
                <SeatMap 
                  match={match} 
                  selectedSeats={selectedSeats} 
                  onSeatSelect={handleSeatSelect} 
                  bookedSeats={bookedSeats} 
                />
                {selectedSeats.length > 0 && (
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-[#0B1B32]">
                      {selectedSeats.length} seat(s) selected • {formatCurrency(totalAmount)}
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
                    {selectedSeats.map((seat) => (
                      <div key={seat.number} className="flex justify-between text-sm mb-2">
                        <span>Seat {seat.number} ({seat.type})</span>
                        <span>{formatCurrency(calculateTicketPrice(match.ticket_price, seat.type))}</span>
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
                      Back to Seats
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
                    <strong>Booking Details:</strong> {selectedSeats.length} ticket(s) for {match.home_team} vs {match.away_team}
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    <strong>Total Paid:</strong> {formatCurrency(totalAmount)}
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
                    onClick={() => navigate('/my-tickets')}
                    className="bg-[#0B1B32] text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90 transition"
                  >
                    View My Tickets
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