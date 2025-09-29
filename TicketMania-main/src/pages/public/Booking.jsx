import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  SportsSoccer,
  CalendarToday,
  LocationOn,
  EventSeat,
  ArrowBack,
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useMatches, useUserTickets } from '../../hooks/useFirebase'
import SeatMap from '../../components/SeatMap'
import { PageLoader } from '../../components/LoadingSpinner'
import { mpesaService } from '../../services/api'
import { 
  formatDate, 
  formatCurrency, 
  validatePhoneNumber, 
  formatPhoneNumber, 
  calculateTicketPrice 
} from '../../utils/helpers'

const Booking = () => {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { matches, loading: matchesLoading, updateMatch } = useMatches()
  const { createTicket, updateTicket, tickets: userTickets } = useUserTickets(user?.uid)
  
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const [bookedSeats, setBookedSeats] = useState([])
  const [paymentStatus, setPaymentStatus] = useState('')
  const [createdTicketIds, setCreatedTicketIds] = useState([])
  const [checkoutRequestId, setCheckoutRequestId] = useState('')

  // Safaricom test number for development
  const SAFARICOM_TEST_NUMBER = '254708374149'

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const foundMatch = matches.find(m => m.id === matchId)
        if (!foundMatch) {
          setError('Match not found')
          setLoading(false)
          return
        }
        setMatch(foundMatch)

        // Check if there are enough seats
        if (foundMatch.available_seats < selectedSeats.length) {
          setError('Not enough seats available')
        }

        // Fetch already booked seats for this match
        const booked = await fetchBookedSeats(matchId)
        setBookedSeats(booked)
        
      } catch (err) {
        setError('Failed to load match details')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (matchId && matches.length > 0) {
      fetchMatchData()
    }
  }, [matchId, matches, selectedSeats.length])

  // Pre-fill test number in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && step === 2) {
      setPhoneNumber(SAFARICOM_TEST_NUMBER.replace('254', '0'))
    }
  }, [step])

  // Fetch booked seats for the current match
  const fetchBookedSeats = async (matchId) => {
    try {
      // This would typically come from your Firestore query
      // For now, return empty array - you'll implement this based on your data structure
      return []
    } catch (error) {
      console.error('Error fetching booked seats:', error)
      return []
    }
  }

  const handleSeatSelect = (seat) => {
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.number === seat.number)
      if (isSelected) {
        return prev.filter(s => s.number !== seat.number)
      } else {
        if (match && prev.length >= match.available_seats) {
          alert(`Only ${match.available_seats} seats available`)
          return prev
        }
        // Check if seat is already booked
        if (bookedSeats.includes(seat.number)) {
          alert('This seat is already booked. Please select another seat.')
          return prev
        }
        return [...prev, seat]
      }
    })
  }

  const handleProceedToPayment = () => {
    if (!user) {
      alert('Please sign in to book tickets')
      navigate('/login', { state: { from: `/booking/${matchId}` } })
      return
    }
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat')
      return
    }
    if (match && selectedSeats.length > match.available_seats) {
      alert(`Only ${match.available_seats} seats available`)
      return
    }
    setStep(2)
  }

  const initiateMpesaPayment = async (ticketIds) => {
    try {
      setPaymentStatus('initiating')
      
      // Use test number for development, actual number for production
      const phoneToUse = process.env.NODE_ENV === 'development' 
        ? SAFARICOM_TEST_NUMBER 
        : formatPhoneNumber(phoneNumber)

      // Use test amount (KES 1) for development, actual amount for production
      const amountToUse = process.env.NODE_ENV === 'development' ? 1 : totalAmount

      const response = await mpesaService.initiatePayment({
        phoneNumber: phoneToUse,
        amount: amountToUse,
        accountReference: `TICKET_${ticketIds.join('_')}`,
        transactionDesc: `Tickets for ${match.home_team} vs ${match.away_team}`
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to initiate payment')
      }

      return response.data

    } catch (error) {
      console.error('M-Pesa payment initiation error:', error)
      throw new Error(error.response?.data?.error || error.message || 'Failed to initiate payment')
    }
  }

  const sendConfirmationSMS = async (ticketIds) => {
    try {
      const message = `Your booking for ${match.home_team} vs ${match.away_team} is confirmed!\n\n` +
        `Seats: ${selectedSeats.map(s => s.number).join(', ')}\n` +
        `Amount: KES ${totalAmount}\n` +
        `View your tickets: ${window.location.origin}/my-tickets\n\n` +
        `Thank you for choosing FootballTickets!`

      console.log('SMS would be sent:', message)
      // Uncomment when ready to send actual SMS
      // await smsService.sendSMS({ phoneNumber, message })

    } catch (error) {
      console.error('SMS sending error:', error)
    }
  }

  const checkPaymentStatus = async (checkoutRequestId) => {
    try {
      const response = await mpesaService.checkPaymentStatus(checkoutRequestId)
      return response
    } catch (error) {
      console.error('Payment status check error:', error)
      throw error
    }
  }

  const createTemporaryTickets = async () => {
    const ticketIds = []
    const normalizedPhone = formatPhoneNumber(phoneNumber)

    for (const seat of selectedSeats) {
      const ticketData = {
        match_id: matchId,
        user_id: user.uid,
        user_email: user.email,
        user_name: user.displayName || user.email,
        seat_number: seat.number,
        seat_type: seat.type,
        price: calculateTicketPrice(match.ticket_price, seat.type),
        status: 'pending_payment',
        phone_number: normalizedPhone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      try {
        const ticket = await createTicket(ticketData)
        ticketIds.push(ticket.id)
      } catch (error) {
        console.error('Error creating ticket:', error)
        throw new Error('Failed to create ticket. Please try again.')
      }
    }

    return ticketIds
  }

  const updateTicketsWithCheckoutId = async (ticketIds, checkoutRequestId) => {
    for (const ticketId of ticketIds) {
      try {
        await updateTicket(ticketId, {
          mpesa_checkout_request_id: checkoutRequestId,
          updated_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error updating ticket with checkout ID:', error)
        // Continue with other tickets even if one fails
      }
    }
  }

  const markTicketsAsFailed = async (ticketIds) => {
    for (const ticketId of ticketIds) {
      try {
        await updateTicket(ticketId, {
          status: 'payment_failed',
          updated_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error marking ticket as failed:', error)
      }
    }
  }

  const markTicketsAsConfirmed = async (ticketIds) => {
    for (const ticketId of ticketIds) {
      try {
        await updateTicket(ticketId, {
          status: 'confirmed',
          payment_status: 'completed',
          updated_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error marking ticket as confirmed:', error)
      }
    }
  }

  const handlePayment = async () => {
    // In development, skip phone validation for test number
    if (process.env.NODE_ENV !== 'development' && !validatePhoneNumber(phoneNumber)) {
      alert('Please enter a valid Kenyan phone number (e.g., 0712345678)')
      return
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat')
      return
    }

    if (!match) {
      alert('Match not found')
      return
    }

    if (selectedSeats.length > match.available_seats) {
      alert(`Only ${match.available_seats} seats available`)
      return
    }

    setProcessing(true)
    setError('')

    try {
      // Step 1: Create temporary tickets first
      const ticketIds = await createTemporaryTickets()
      setCreatedTicketIds(ticketIds)

      // Step 2: Initiate M-Pesa payment through backend
      const mpesaResponse = await initiateMpesaPayment(ticketIds)
      setCheckoutRequestId(mpesaResponse.CheckoutRequestID)
      
      // Step 3: Update tickets with checkout request ID
      await updateTicketsWithCheckoutId(ticketIds, mpesaResponse.CheckoutRequestID)

      setPaymentStatus('pending')

      // Step 4: Wait for payment confirmation with improved polling
      let paymentConfirmed = false
      let attempts = 0
      const maxAttempts = 36 // 3 minutes maximum (36 * 5 seconds)

      while (!paymentConfirmed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
        
        try {
          const checkResponse = await checkPaymentStatus(mpesaResponse.CheckoutRequestID)
          
          if (checkResponse.success && checkResponse.paymentConfirmed) {
            paymentConfirmed = true
            break
          }
          
          // Optional: Show progress to user
          if (attempts % 6 === 0) { // Every 30 seconds
            console.log(`Still waiting for payment confirmation... (${attempts * 5}s)`)
          }
        } catch (checkError) {
          console.warn('Payment check failed:', checkError)
        }
        
        attempts++
      }

      if (!paymentConfirmed) {
        throw new Error('Payment confirmation timeout. Please check your M-Pesa messages and refresh your tickets page.')
      }

      // Step 5: Mark tickets as confirmed
      await markTicketsAsConfirmed(ticketIds)

      // Step 6: Update match available seats
      try {
        await updateMatch(matchId, {
          available_seats: match.available_seats - selectedSeats.length,
          updated_at: new Date().toISOString()
        })
      } catch (updateError) {
        console.error('Error updating match seats:', updateError)
        // Continue even if seat update fails
      }

      // Step 7: Send confirmation SMS
      await sendConfirmationSMS(ticketIds)

      setStep(3)

    } catch (err) {
      console.error('Payment error:', err)
      
      // Clean up: Mark tickets as failed if payment failed
      if (createdTicketIds.length > 0) {
        await markTicketsAsFailed(createdTicketIds)
      }
      
      // More specific error messages
      if (err.message.includes('permission') || err.message.includes('FirebaseError')) {
        setError('Database permission error. Please refresh the page and try again.')
      } else if (err.message.includes('timeout')) {
        setError('Payment confirmation timeout. Please check your M-Pesa messages.')
      } else {
        setError(err.message || 'Payment failed. Please try again.')
      }
    } finally {
      setProcessing(false)
      setPaymentStatus('')
    }
  }

  const handleBackToSeats = () => {
    setStep(1)
    setError('')
    setPhoneNumber('')
  }

  const totalAmount = selectedSeats.reduce(
    (total, seat) => total + calculateTicketPrice(match?.ticket_price || 0, seat.type), 
    0
  )

  if (matchesLoading || loading) return <PageLoader />
  if (error && !match) return <div className="text-center text-red-600 p-8">{error}</div>
  if (!match) return <div className="text-center p-8">Match not found</div>

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-white mb-6 hover:underline transition-all duration-200 hover:scale-105"
        >
          <ArrowBack className="h-5 w-5" />
          <span>Back to Matches</span>
        </button>

        {/* Progress Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-300
                  ${step >= stepNumber 
                    ? 'bg-[#0B1B32] text-white shadow-lg' 
                    : 'bg-white/40 text-[#0B1B32]'}`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-20 h-1 rounded-full transition-all duration-300
                    ${step > stepNumber ? 'bg-[#0B1B32]' : 'bg-white/40'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Match Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sticky top-6 border border-white/30 transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-xl font-bold text-[#0B1B32] mb-4">Match Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <SportsSoccer className="h-6 w-6 text-[#0B1B32]" />
                  <div className="font-semibold text-lg">
                    {match.home_team} vs {match.away_team}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarToday className="h-6 w-6 text-[#26415E]" />
                  <div className="font-medium">{formatDate(match.match_date)}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <LocationOn className="h-6 w-6 text-[#26415E]" />
                  <div className="font-medium">{match.venue}</div>
                </div>

                <div className="border-t border-white/30 pt-4">
                  <div className="flex justify-between text-sm text-[#0B1B32]/80 mb-1">
                    <span>Base Ticket Price:</span>
                    <span>{formatCurrency(match.ticket_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#0B1B32]/80">
                    <span>Available Seats:</span>
                    <span className={`font-semibold ${match.available_seats < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {match.available_seats?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Seats */}
              {selectedSeats.length > 0 && (
                <div className="border-t border-white/30 pt-4 mt-4">
                  <h3 className="font-semibold mb-2 flex items-center text-[#0B1B32]">
                    <EventSeat className="h-5 w-5 mr-2" />
                    Selected Seats ({selectedSeats.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedSeats.map(seat => (
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
                    <span className="text-[#0B1B32]">
                      {formatCurrency(
                        process.env.NODE_ENV === 'development' ? 1 : totalAmount
                      )}
                      {process.env.NODE_ENV === 'development' && (
                        <span className="text-sm text-yellow-600 ml-1">(test amount)</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="lg:col-span-2 space-y-8">
            {step === 1 && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/30">
                <h2 className="text-2xl font-bold text-[#0B1B32] mb-6">Select Your Seats</h2>
                
                {match.available_seats === 0 && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <strong>Sold Out!</strong> All seats for this match have been booked.
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
                    <div className="text-sm text-[#0B1B32]/70">
                      {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected • {formatCurrency(totalAmount)}
                      {process.env.NODE_ENV === 'development' && (
                        <span className="text-yellow-600 ml-1">(will charge KES 1 for testing)</span>
                      )}
                    </div>
                    <button 
                      onClick={handleProceedToPayment} 
                      className="bg-[#0B1B32] text-white px-8 py-3 rounded-2xl font-medium hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/30">
                <h2 className="text-2xl font-bold text-[#0B1B32] mb-6">Payment Details</h2>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                    <Warning className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}
                
                {/* Development Mode Notice */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded-lg mb-6">
                    <div className="flex items-center mb-2">
                      <Info className="h-5 w-5 mr-2" />
                      <strong>Development Mode - M-Pesa Testing</strong>
                    </div>
                    <p className="text-sm">
                      Using Safaricom test number: <strong>{SAFARICOM_TEST_NUMBER}</strong><br />
                      Test Amount: <strong>KES 1</strong><br />
                      Use any 4-digit PIN when prompted on your phone
                    </p>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Payment Summary */}
                  <div className="bg-[#EBF0F6] rounded-2xl p-5 border border-[#0B1B32]/20">
                    <h3 className="font-semibold mb-3 text-[#0B1B32] text-lg">Order Summary</h3>
                    <div className="space-y-2">
                      {selectedSeats.map(seat => (
                        <div key={seat.number} className="flex justify-between text-sm">
                          <span>Seat {seat.number} ({seat.type})</span>
                          <span>{formatCurrency(calculateTicketPrice(match.ticket_price, seat.type))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[#0B1B32]/20 mt-3 pt-3 font-semibold flex justify-between text-lg">
                      <span>Total Amount:</span>
                      <span className="text-[#0B1B32]">
                        {formatCurrency(
                          process.env.NODE_ENV === 'development' ? 1 : totalAmount
                        )}
                        {process.env.NODE_ENV === 'development' && (
                          <span className="text-sm text-yellow-600 ml-1">(test amount)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* M-Pesa Payment */}
                  <div>
                    <h3 className="font-semibold mb-3 text-[#0B1B32] text-lg">M-Pesa Payment</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0B1B32] mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g., 0712345678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full rounded-xl border border-white/30 px-4 py-3 bg-white/60 focus:outline-none focus:ring-2 focus:ring-[#0B1B32] focus:border-transparent transition-all duration-200"
                          disabled={processing || process.env.NODE_ENV === 'development'}
                        />
                        <p className="text-sm text-[#0B1B32]/70 mt-1">
                          {process.env.NODE_ENV === 'development' 
                            ? 'Using Safaricom test number for development'
                            : 'Enter your M-Pesa registered phone number'
                          }
                        </p>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Warning className="h-5 w-5 text-yellow-600" />
                          <span className="font-semibold text-yellow-800">Payment Instructions</span>
                        </div>
                        <p className="text-sm text-yellow-700">
                          {paymentStatus === 'initiating' && '🔄 Initiating payment request...'}
                          {paymentStatus === 'pending' && '📱 Check your phone for M-Pesa prompt. Enter your PIN to complete payment.'}
                          {!paymentStatus && 'You will receive an M-Pesa prompt on your phone to complete the payment. Please have your M-Pesa PIN ready.'}
                        </p>
                      </div>

                      <div className="flex space-x-4">
                        <button 
                          onClick={handleBackToSeats}
                          disabled={processing}
                          className="flex-1 bg-gray-500 text-white py-3 rounded-2xl font-medium hover:bg-gray-600 disabled:opacity-50 transition-all duration-200"
                        >
                          Back to Seats
                        </button>
                        <button 
                          onClick={handlePayment}
                          disabled={processing || (!phoneNumber && process.env.NODE_ENV !== 'development') || paymentStatus}
                          className="flex-1 bg-[#0B1B32] text-white py-3 rounded-2xl font-medium hover:opacity-90 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                          {processing ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>
                                {paymentStatus === 'initiating' ? 'Initiating Payment...' : 
                                 paymentStatus === 'pending' ? 'Waiting for Payment...' : 'Processing...'}
                              </span>
                            </div>
                          ) : `Pay ${formatCurrency(
                            process.env.NODE_ENV === 'development' ? 1 : totalAmount
                          )}`}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/30 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 hover:scale-110">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                
                <h2 className="text-3xl font-bold text-[#0B1B32] mb-4">Payment Successful!</h2>
                <p className="text-[#0B1B32]/70 mb-6 text-lg">
                  Your tickets have been booked successfully. {process.env.NODE_ENV !== 'development' && 'You will receive a confirmation SMS shortly.'}
                </p>

                <div className="bg-[#EBF0F6] rounded-2xl p-6 mb-8 border border-[#0B1B32]/20">
                  <h3 className="font-semibold mb-4 text-[#0B1B32] text-xl">Booking Details</h3>
                  <div className="space-y-3 text-[#0B1B32]/80 text-left">
                    <div className="flex justify-between py-2 border-b border-[#0B1B32]/10">
                      <span className="font-medium">Match:</span>
                      <span>{match.home_team} vs {match.away_team}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#0B1B32]/10">
                      <span className="font-medium">Seats:</span>
                      <span className="font-semibold">{selectedSeats.map(s => s.number).join(', ')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#0B1B32]/10">
                      <span className="font-medium">Date:</span>
                      <span>{formatDate(match.match_date)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-medium">Amount Paid:</span>
                      <span className="font-bold text-lg text-[#0B1B32]">
                        {formatCurrency(totalAmount)}
                        {process.env.NODE_ENV === 'development' && (
                          <span className="text-sm text-yellow-600 ml-1">(charged KES 1 for testing)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => navigate('/my-tickets')}
                    className="bg-[#0B1B32] text-white px-8 py-3 rounded-2xl font-medium hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    View My Tickets
                  </button>
                  <button 
                    onClick={() => navigate('/matches')}
                    className="bg-white border-2 border-[#0B1B32] text-[#0B1B32] px-8 py-3 rounded-2xl font-medium hover:bg-[#EBF0F6] transition-all duration-200 hover:scale-105"
                  >
                    Book More Tickets
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Pro Tip:</strong> Save your tickets to your phone for quick access at the stadium entrance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking