import { APP_CONFIG } from './constants';

/* -------------------------------------------------------------------------- */
/* ✅ Format currency for Kenya Shillings */
/* -------------------------------------------------------------------------- */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount);
}

/* -------------------------------------------------------------------------- */
/* ✅ Robust Date Formatter */
/* -------------------------------------------------------------------------- */
export const formatDate = (dateInput, options = {}) => {
  if (!dateInput) return 'Invalid Date';

  let date;

  try {
    // Firestore Timestamp object
    if (typeof dateInput === 'object' && dateInput.seconds) {
      date = new Date(dateInput.seconds * 1000);
    }
    // JS Date object
    else if (dateInput instanceof Date) {
      date = dateInput;
    }
    // UNIX timestamp (ms or s)
    else if (typeof dateInput === 'number') {
      date = new Date(
        dateInput.toString().length === 10 ? dateInput * 1000 : dateInput
      );
    }
    // String (ISO or other)
    else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return 'Invalid Date';
  } catch (err) {
    console.error('Date parse error:', err, dateInput);
    return 'Invalid Date';
  }

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Intl.DateTimeFormat('en-KE', { ...defaultOptions, ...options }).format(date);
}

/* -------------------------------------------------------------------------- */
/* ✅ Generate seat map data */
/* -------------------------------------------------------------------------- */
export const generateSeatMap = (totalSeats, bookedSeats = []) => {
  const { rows, seatsPerRow, vipRows, premiumRows } = APP_CONFIG.stadium;
  const seats = [];

  for (let row = 1; row <= rows; row++) {
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      const seatNumber = `${String.fromCharCode(64 + row)}${seat}`;
      let type = 'standard';

      if (vipRows.includes(row)) type = 'vip';
      if (premiumRows.includes(row)) type = 'premium';

      const isBooked = bookedSeats.includes(seatNumber);

      seats.push({
        number: seatNumber,
        row,
        seat,
        type,
        priceMultiplier: APP_CONFIG.seatTypes[type.toUpperCase()]?.priceMultiplier ?? 1,
        color: APP_CONFIG.seatTypes[type.toUpperCase()]?.color ?? '#ccc',
        available: !isBooked
      });
    }
  }

  return seats;
}

/* -------------------------------------------------------------------------- */
/* ✅ Updated ticket price calculation */
/* -------------------------------------------------------------------------- */
export const calculateTicketPrice = (basePrice, seatType) => {
  const multipliers = {
    'standard': 1,
    'vip': 1.5,
    'premium': 2
  };
  return Math.round(basePrice * (multipliers[seatType?.toLowerCase()] || 1));
}

/* -------------------------------------------------------------------------- */
/* ✅ IMPROVED: Generate QR code data for tickets - COMPATIBLE VERSION */
/* -------------------------------------------------------------------------- */
export const generateQRData = (ticketId, matchId, seatNumber) => {
  try {
    const raw = `${ticketId}|${matchId}|${seatNumber}`;
    
    // Use simple Base64 encoding for better compatibility with scanner
    // This avoids UTF-8 complications and works reliably across all devices
    return btoa(raw);
  } catch (error) {
    console.error('QR generation error:', error);
    // Fallback to raw data if Base64 fails (shouldn't happen with simple ASCII)
    return `${ticketId}|${matchId}|${seatNumber}`;
  }
}

/* -------------------------------------------------------------------------- */
/* ✅ COMPATIBLE QR validation and deactivation system */
/* -------------------------------------------------------------------------- */
/**
 * Validate a scanned QR code (Base64 or plain text)
 * @param {string} qrString - QR code string (Base64 or plain)
 * @returns {object} { valid: boolean, message: string, data?: object }
 */
export const validateAndDeactivateQR = (qrString) => {
  try {
    let decoded;

    // ✅ Try Base64 decoding first (compatible with new encoding)
    try {
      decoded = atob(qrString);
    } catch {
      // 🕐 Fallback for raw string (backward compatibility)
      decoded = qrString;
    }

    const [ticketId, matchId, seatNumber] = decoded.split('|');

    if (!ticketId || !matchId || !seatNumber) {
      return { valid: false, message: 'Invalid QR data format' };
    }

    // Retrieve previously used QR codes
    const usedQRCodes = JSON.parse(localStorage.getItem('usedQRCodes') || '[]');

    // Check if already used
    if (usedQRCodes.includes(ticketId)) {
      return { valid: false, message: 'This ticket has already been used.' };
    }

    // Mark QR code as used
    usedQRCodes.push(ticketId);
    localStorage.setItem('usedQRCodes', JSON.stringify(usedQRCodes));

    return {
      valid: true,
      message: 'Ticket validated successfully.',
      data: { ticketId, matchId, seatNumber }
    };
  } catch (error) {
    console.error('QR validation error:', error);
    return { valid: false, message: 'Invalid or unreadable QR code.' };
  }
}

/**
 * Reactivate (reset) all used QR codes — e.g., for testing or admin reset
 */
export const resetUsedQRCodes = () => {
  localStorage.removeItem('usedQRCodes');
}

/* -------------------------------------------------------------------------- */
/* ✅ Phone validation and formatting */
/* -------------------------------------------------------------------------- */
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(07\d{8}|011\d{7}|2547\d{8}|25411\d{7})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return `254${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('254')) {
    return cleaned;
  } else {
    return `254${cleaned}`;
  }
}

/* -------------------------------------------------------------------------- */
/* ✅ Debounce function for search inputs */
/* -------------------------------------------------------------------------- */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* -------------------------------------------------------------------------- */
/* ✅ Check if user is admin */
/* -------------------------------------------------------------------------- */
export const isAdminUser = (email) => {
  const adminDomains = ['@admin.com', '@footballtickets.com'];
  return adminDomains.some(domain => email?.endsWith(domain));
}

/* -------------------------------------------------------------------------- */
/* ✅ Local storage helpers */
/* -------------------------------------------------------------------------- */
export const storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key) => {
    localStorage.removeItem(key);
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ NEW: Test QR compatibility function */
/* -------------------------------------------------------------------------- */
export const testQRCompatibility = () => {
  const testData = {
    ticketId: 'test123',
    matchId: 'match456', 
    seatNumber: 'A12'
  };
  
  const qrData = generateQRData(testData.ticketId, testData.matchId, testData.seatNumber);
  console.log('Generated QR:', qrData);
  
  // Test parsing
  try {
    const decoded = atob(qrData);
    const parsed = decoded.split('|');
    console.log('Parsed test data:', parsed);
    
    return {
      success: parsed[0] === testData.ticketId && 
               parsed[1] === testData.matchId && 
               parsed[2] === testData.seatNumber,
      generated: qrData,
      parsed: decoded
    };
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.message };
  }
}