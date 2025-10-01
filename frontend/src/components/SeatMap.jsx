import React, { useState, useEffect } from 'react';
import {
  ConfirmationNumber,
  Warning,
  AddCircleOutline,
  RemoveCircleOutline,
  Chair,
  KingBed
} from '@mui/icons-material';
import { calculateTicketPrice, formatCurrency } from '../utils/helpers';
import { APP_CONFIG } from '../utils/constants';

// Define the ticket categories available for selection
const TICKET_CATEGORIES = [
  {
    type: 'standard',
    name: 'Standard Seating',
    description: 'Great views from the general seating areas.',
    icon: <Chair className="h-8 w-8 text-[#0B1B32]/70" />,
    bgColor: 'bg-white',
    textColor: 'text-[#0B1B32]'
  },
  {
    type: 'vip',
    name: 'VIP Experience',
    description: 'Premium seats with exclusive access and the best sightlines.',
    icon: <KingBed className="h-8 w-8 text-[#0B1B32]/70" />,
    bgColor: 'bg-[#F4F3EF]',
    textColor: 'text-[#0B1B32]'
  }
];

const SeatMap = ({
  match,
  onSelectionChange, // Renamed prop for clarity
  initialSelection = {}
}) => {
  const [quantities, setQuantities] = useState(initialSelection);

  // Notify the parent component whenever the selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedTickets = Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([type, quantity]) => ({
          type,
          quantity,
          price: calculateTicketPrice(match?.ticket_price || 0, type)
        }));

      const total = selectedTickets.reduce((acc, ticket) => acc + ticket.price * ticket.quantity, 0);
      
      onSelectionChange({
        tickets: selectedTickets,
        total
      });
    }
  }, [quantities, match, onSelectionChange]);

  const handleQuantityChange = (type, amount) => {
    setQuantities(prev => {
      const currentQuantity = prev[type] || 0;
      const newQuantity = Math.max(0, currentQuantity + amount); // Ensures quantity doesn't go below 0

      // If the new quantity is 0, we can remove it from the state object for cleanliness
      if (newQuantity === 0) {
        const { [type]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [type]: newQuantity,
      };
    });
  };

  if (!match) {
    return (
      <div className="text-center p-12 rounded-2xl bg-[#F4F3EF] shadow-md">
        <Warning className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No match selected</p>
      </div>
    );
  }
  
  const totalSelected = Object.values(quantities).reduce((sum, count) => sum + count, 0);

  return (
    <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-[#E5E7EB] shadow-lg">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-semibold text-[#0B1B32] mb-2">
          {match.venue}
        </h3>
        <p className="text-lg text-[#0B1B32]/80">Select Ticket Category</p>
      </div>

      {/* Categories Selection */}
      <div className="space-y-4 mb-10">
        {TICKET_CATEGORIES.map((category) => {
          const price = calculateTicketPrice(match.ticket_price, category.type);
          const currentQuantity = quantities[category.type] || 0;

          return (
            <div
              key={category.type}
              className={`p-6 rounded-2xl border transition-all flex items-center justify-between ${category.bgColor} ${
                currentQuantity > 0 ? 'border-[#0B1B32] shadow-md' : 'border-[#E5E7EB]'
              }`}
            >
              <div className="flex items-center">
                 <div className="mr-5">{category.icon}</div>
                <div>
                  <h4 className={`text-lg font-bold ${category.textColor}`}>{category.name}</h4>
                  <p className={`text-sm ${category.textColor}/70`}>{category.description}</p>
                  <p className={`text-md font-semibold mt-1 ${category.textColor}`}>{formatCurrency(price)}</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 bg-[#EBF0F6] p-2 rounded-full">
                <button
                  onClick={() => handleQuantityChange(category.type, -1)}
                  className="text-[#0B1B32]/60 hover:text-[#0B1B32] transition-colors"
                  disabled={currentQuantity === 0}
                  aria-label={`Decrease ${category.name} quantity`}
                >
                  <RemoveCircleOutline />
                </button>
                <span className="w-8 text-center text-lg font-bold text-[#0B1B32]">{currentQuantity}</span>
                <button
                  onClick={() => handleQuantityChange(category.type, 1)}
                  className="text-[#0B1B32]/60 hover:text-[#0B1B32] transition-colors"
                  aria-label={`Increase ${category.name} quantity`}
                >
                  <AddCircleOutline />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {totalSelected > 0 && (
        <div className="p-6 bg-[#F4F3EF] rounded-2xl shadow-lg border border-[#E5E7EB]">
          <h4 className="font-semibold text-[#0B1B32] mb-4 flex items-center text-xl">
            <ConfirmationNumber className="h-6 w-6 mr-3 text-[#0B1B32]" />
            Your Selection
          </h4>
          <div className="space-y-3">
            {Object.entries(quantities).map(([type, quantity]) => {
                if (quantity === 0) return null;
                const category = TICKET_CATEGORIES.find(c => c.type === type);
                const price = calculateTicketPrice(match.ticket_price, type);

                return (
                    <div key={type} className="flex justify-between items-center bg-white/90 p-3 rounded-lg">
                        <div>
                            <span className="font-semibold text-[#0B1B32]">{quantity} x </span> 
                            <span>{category.name}</span>
                        </div>
                        <span className="font-bold text-[#0B1B32]">
                           {formatCurrency(price * quantity)}
                        </span>
                    </div>
                )
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
            <div className="flex justify-between font-bold text-[#0B1B32]">
              <span className="text-lg">Total:</span>
              <span className="text-2xl">
                {formatCurrency(
                  Object.entries(quantities).reduce((total, [type, quantity]) => {
                    return total + calculateTicketPrice(match.ticket_price, type) * quantity;
                  }, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMap;