export const APP_CONFIG = {
  // Colors
  colors: {
    primary: {
      light: '#ebf0f6',
      DEFAULT: '#ffffff'
    },
    secondary: {
      yellow: '#FFD600',
      navy: '#1e3a8a'
    }
  },

  // Seat types and pricing
  seatTypes: {
    STANDARD: { name: 'Standard', priceMultiplier: 1, color: '#4ade80' },
    VIP: { name: 'VIP', priceMultiplier: 1.5, color: '#f59e0b' },
    PREMIUM: { name: 'Premium', priceMultiplier: 2, color: '#ef4444' }
  },

  // Payment status
  paymentStatus: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },

  // Ticket status
  ticketStatus: {
    ACTIVE: 'active',
    USED: 'used',
    CANCELLED: 'cancelled'
  },

  // Stadium configuration
  stadium: {
    rows: 20,
    seatsPerRow: 30,
    vipRows: [1, 2, 3],
    premiumRows: [4, 5, 6]
  },

  // M-Pesa configuration
  mpesa: {
    businessShortCode: '174379',
    transactionType: 'CustomerPayBillOnline',
    callbackURL: `${window.location.origin}/api/mpesa-callback`
  }
}

export const NAVIGATION = {
  public: [
    { name: 'Home', href: '/', icon: 'Home' },
    { name: 'Matches', href: '/matches', icon: 'SportsSoccer' },
    { name: 'My Tickets', href: '/my-tickets', icon: 'ConfirmationNumber' }
  ],
  admin: [
    { name: 'Dashboard', href: '/admin', icon: 'Dashboard' },
    { name: 'Matches', href: '/admin/matches', icon: 'SportsSoccer' },
    { name: 'Tickets', href: '/admin/tickets', icon: 'ConfirmationNumber' },
    { name: 'Calendar', href: '/admin/calendar', icon: 'CalendarToday' }
  ]
}

export const TEAMS = [
  'AFC Leopards', 'Gor Mahia', 'Tusker FC', 'Sofapaka', 'Ulinzi Stars',
  'Kariobangi Sharks', 'Bandari FC', 'KCB', 'Posta Rangers', 'Nairobi City Stars',
  'Wazito FC', 'Bidco United', 'Vihiga United', 'FC Talanta'
]