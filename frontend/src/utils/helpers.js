import { APP_CONFIG } from './constants'

// Format currency for Kenya Shillings
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount)
}

// Format date and time
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString)
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return date.toLocaleDateString('en-KE', { ...defaultOptions, ...options })
}

// Generate seat map data
export const generateSeatMap = (totalSeats, bookedSeats = []) => {
  const { rows, seatsPerRow, vipRows, premiumRows } = APP_CONFIG.stadium
  const seats = []

  for (let row = 1; row <= rows; row++) {
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      const seatNumber = `${String.fromCharCode(64 + row)}${seat}`
      let type = 'standard'
      
      if (vipRows.includes(row)) type = 'vip'
      if (premiumRows.includes(row)) type = 'premium'

      const isBooked = bookedSeats.includes(seatNumber)

      seats.push({
        number: seatNumber,
        row,
        seat,
        type,
        priceMultiplier: APP_CONFIG.seatTypes[type.toUpperCase()]?.priceMultiplier ?? 1,
        color: APP_CONFIG.seatTypes[type.toUpperCase()]?.color ?? '#ccc',
        available: !isBooked
      })
    }
  }

  return seats
}

// ✅ Updated ticket price calculation (with fixed multipliers)
export const calculateTicketPrice = (basePrice, seatType) => {
  const multipliers = {
    'standard': 1,
    'vip': 1.5,
    'premium': 2
  }
  return Math.round(basePrice * (multipliers[seatType?.toLowerCase()] || 1))
}

// Generate QR code data for tickets
export const generateQRData = (ticketId, matchId, seatNumber) => {
  return JSON.stringify({
    ticketId,
    matchId,
    seatNumber,
    timestamp: Date.now()
  })
}

// ✅ Updated phone validation (Kenyan numbers: 07x..., 011..., or 254 versions)
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(07\d{8}|011\d{7}|2547\d{8}|25411\d{7})$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// ✅ Updated phone formatter (always return 254XXXXXXXXX)
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    return `254${cleaned.substring(1)}`
  } else if (cleaned.startsWith('254')) {
    return cleaned
  } else {
    return `254${cleaned}`
  }
}

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Check if user is admin (simple email-based check)
export const isAdminUser = (email) => {
  const adminDomains = ['@admin.com', '@footballtickets.com']
  return adminDomains.some(domain => email?.endsWith(domain))
}

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key))
    } catch {
      return null
    }
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key) => {
    localStorage.removeItem(key)
  }
}
