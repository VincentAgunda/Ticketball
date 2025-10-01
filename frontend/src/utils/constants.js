// src/utils/constants.js

// ✅ Global App Configuration
export const APP_CONFIG = {
  colors: {
    primary: {
      light: '#ebf0f6',
      DEFAULT: '#ffffff',
    },
    secondary: {
      yellow: '#FFD600',
      navy: '#1e3a8a',
    },
  },

  seatTypes: {
    STANDARD: { name: 'Standard', priceMultiplier: 1, color: '#4ade80' },
    VIP: { name: 'VIP', priceMultiplier: 1.5, color: '#f59e0b' },
    PREMIUM: { name: 'Premium', priceMultiplier: 2, color: '#ef4444' },
  },

  paymentStatus: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },

  ticketStatus: {
    ACTIVE: 'active',
    USED: 'used',
    CANCELLED: 'cancelled',
  },

  stadium: {
    rows: 20,
    seatsPerRow: 30,
    vipRows: [1, 2, 3],
    premiumRows: [4, 5, 6],
  },

  mpesa: {
    businessShortCode: '174379',
    transactionType: 'CustomerPayBillOnline',
    callbackURL: `${window.location.origin}/api/mpesa-callback`,
  },
}

// ✅ Navigation
export const NAVIGATION = {
  public: [
    { name: 'Home', href: '/', icon: 'Home' },
    { name: 'Matches', href: '/matches', icon: 'SportsSoccer' },
    { name: 'My Tickets', href: '/my-tickets', icon: 'ConfirmationNumber' },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin', icon: 'Dashboard' },
    { name: 'Matches', href: '/admin/matches', icon: 'SportsSoccer' },
    { name: 'Tickets', href: '/admin/tickets', icon: 'ConfirmationNumber' },
    { name: 'Calendar', href: '/admin/calendar', icon: 'CalendarToday' },
  ],
}

// ✅ Teams
export const TEAMS = [
  'AFC Leopards',
  'Gor Mahia',
  'Tusker FC',
  'Sofapaka',
  'Ulinzi Stars',
  'Kariobangi Sharks',
  'Bandari FC',
  'KCB',
  'Posta Rangers',
  'Nairobi City Stars',
  'Wazito FC',
  'Bidco United',
  'Vihiga United',
  'FC Talanta',
]

// ✅ Team Logos (make sure these exist in /public/images/teams/)
export const TEAM_LOGOS = {
  'AFC Leopards': '/images/afc.png',
  'Gor Mahia': '/images/gor.png',
  'Tusker FC': '/images/teams/tusker-fc.png',
  'Sofapaka': '/images/sofa.png',
  'Ulinzi Stars': '/images/teams/ulinzi-stars.png',
  'Kariobangi Sharks': '/images/teams/kariobangi-sharks.png',
  'Bandari FC': '/images/banda.png',
  'KCB': '/images/teams/kcb.png',
  'Posta Rangers': '/images/teams/posta-rangers.png',
  'Nairobi City Stars': '/images/teams/nairobi-city-stars.png',
  'Wazito FC': '/images/teams/wazito-fc.png',
  'Bidco United': '/images/how-it-works-bg.jpg',
  'Vihiga United': '/images/how-it-works-bg.jpg',
  'FC Talanta': '/images/teams/fc-talanta.png',
}

// ✅ Default fallback logo (neutral placeholder)
export const DEFAULT_LOGO = '/images/teams/default.png'

// ✅ Helper to fetch team logo safely
export const getTeamLogo = (teamName) => {
  if (!teamName) return DEFAULT_LOGO
  return TEAM_LOGOS[teamName] || DEFAULT_LOGO
}
