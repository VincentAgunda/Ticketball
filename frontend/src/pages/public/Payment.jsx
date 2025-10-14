import React from 'react';
import { Warning } from '@mui/icons-material';

/**
 * Presentational Payment component.
 *
 * Props:
 * - selectedTickets: array of selected ticket types { type, price, quantity }
 * - totalAmount: number
 * - phoneNumber: string
 * - setPhoneNumber: fn
 * - processing: boolean
 * - error: string
 * - onBack: fn
 * - onPay: fn
 * - formatCurrency: fn
 */
const Payment = ({
  selectedTickets = [],
  totalAmount = 0,
  phoneNumber = '',
  setPhoneNumber = () => {},
  processing = false,
  error = '',
  onBack = () => {},
  onPay = () => {},
  formatCurrency = (v) => v,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/30">
      <h2 className="text-2xl font-bold mb-6 text-[#0B1B32]">Payment Details</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <Warning className="h-5 w-5 mr-2" />
          <span>{error}</span>
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
            onClick={onBack}
            disabled={processing}
            className="flex-1 bg-gray-500 text-white py-3 rounded-2xl font-medium disabled:opacity-50 hover:bg-gray-600 transition"
          >
            Back to Tickets
          </button>
          <button
            onClick={onPay}
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
  );
};

export default Payment;
