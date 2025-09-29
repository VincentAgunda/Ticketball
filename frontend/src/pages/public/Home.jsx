import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  SportsSoccer,
  ConfirmationNumber,
  Security,
  PhoneAndroid,
  QrCode,
  ArrowUpward,
} from '@mui/icons-material'
import { useMatches } from '../../hooks/useFirebase'
import MatchCard from '../../components/MatchCard'
import { PageLoader } from '../../components/LoadingSpinner'

// Features data
const FEATURES = [
  {
    icon: ConfirmationNumber,
    title: 'Easy Booking',
    description: 'Book your tickets in just a few clicks with our intuitive platform',
  },
  {
    icon: Security,
    title: 'Secure Payments',
    description: 'M-Pesa integration ensures safe and reliable mobile money transactions',
  },
  {
    icon: PhoneAndroid,
    title: 'Mobile Friendly',
    description: 'Optimized for all devices - book from your phone or computer',
  },
  {
    icon: QrCode,
    title: 'Digital Tickets',
    description: 'QR code tickets for quick and contactless entry to matches',
  },
]

const BASE_STATS = [
  { number: 50000, label: 'Tickets Sold' },
  { number: 100, label: 'Matches Hosted' },
  { number: 25000, label: 'Happy Fans' },
  { number: 99, label: 'Satisfaction Rate' },
]

const HOW_IT_WORKS_STEPS = [
  { step: 1, title: 'Select Match', text: 'Choose from upcoming football matches and select your preferred seats' },
  { step: 2, title: 'Pay with M-Pesa', text: 'Complete payment securely using M-Pesa mobile money' },
  { step: 3, title: 'Get Digital Ticket', text: 'Receive QR code ticket instantly - show it at the gate' },
]

// ---- Number Counter Hook ----
const useCountUp = (target, duration = 2000) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const startTime = performance.now()
    const step = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const value = Math.floor(progress * target)
      setCount(value)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}

// Stats Section (with live counting)
const StatsSection = React.memo(({ stats }) => (
  <section className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-10">
    {stats.map((stat, index) => {
      const count = useCountUp(stat.number)
      return (
        <div
          key={index}
          className="text-center rounded-2xl p-6 shadow-lg border border-white/20 transition hover:-translate-y-1 hover:shadow-xl"
          style={{
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <div className="text-4xl font-bold text-white mb-2 drop-shadow">
            {count.toLocaleString()} {stat.label === 'Satisfaction Rate' ? '%' : '+'}
          </div>
          <div className="text-white/80">{stat.label}</div>
        </div>
      )
    })}
  </section>
))

// Features section
const FeaturesSection = React.memo(() => {
  return (
    <section
      className="py-24 relative bg-cover bg-center"
      style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-semibold mb-4 text-white drop-shadow-md">
            Why Choose FootballTickets?
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            A seamless, secure and modern way to experience football.  
            Book tickets effortlessly and join thousands of happy fans.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-8 rounded-3xl shadow-lg transition transform hover:-translate-y-2 hover:shadow-2xl border border-white/20"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white drop-shadow">
                  {feature.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
})

// How it works section
const HowItWorksSection = React.forwardRef((props, ref) => (
  <section
    ref={ref}
    className="relative py-20 rounded-3xl bg-cover bg-center"
    style={{ backgroundImage: "url('/images/stadium-bg.png')" }}
  >
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl"></div>
    <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-white drop-shadow-lg">
          How It Works
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {HOW_IT_WORKS_STEPS.map((item, index) => (
          <div
            key={index}
            className="text-center rounded-2xl p-8 shadow-lg border border-white/20 transition hover:-translate-y-1 hover:shadow-xl"
            style={{
              background:
                'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          >
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto mb-6 text-lg font-bold shadow-inner">
              {item.step}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white drop-shadow">
              {item.title}
            </h3>
            <p className="text-white/80 text-sm">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
))

// Live notice
const RealTimeNotice = React.memo(() => (
  <div className="fixed bottom-4 right-4 bg-green-100/80 border border-green-300/40 text-green-900 px-4 py-2 rounded-lg shadow-lg text-sm backdrop-blur-md">
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>Live match data • Updated just now</span>
    </div>
  </div>
))

// Back to top button
const BackToTopButton = () => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  if (!visible) return null
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 right-5 bg-white/10 backdrop-blur-lg border border-white/20 text-white p-3 rounded-full shadow-lg hover:scale-110 transition"
    >
      <ArrowUpward />
    </button>
  )
}

// Main Home
const Home = () => {
  const { matches, loading, error } = useMatches()
  const howItWorksRef = useRef(null)

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const upcomingMatches = useMemo(() => {
    if (!matches) return []
    const now = new Date()
    return matches
      .filter((match) => {
        const matchDate = match.match_date?.toDate?.() || match.match_date
        return new Date(matchDate) > now
      })
      .sort((a, b) => {
        const dateA = a.match_date?.toDate?.() || a.match_date
        const dateB = b.match_date?.toDate?.() || b.match_date
        return new Date(dateA) - new Date(dateB)
      })
      .slice(0, 3)
  }, [matches])

  const dynamicStats = useMemo(() => {
    if (!matches) return BASE_STATS
    const totalMatches = matches.length
    const totalTicketsSold = matches.reduce(
      (sum, match) => sum + ((match.total_seats || 0) - (match.available_seats || 0)),
      0
    )
    return [
      { number: totalTicketsSold, label: 'Tickets Sold' },
      { number: totalMatches, label: 'Matches Hosted' },
      { number: totalTicketsSold, label: 'Happy Fans' },
      { number: 99, label: 'Satisfaction Rate' },
    ]
  }, [matches])

  const nextMatch = upcomingMatches[0] || null

  if (loading) return <PageLoader />
  if (error) {
    return <div className="text-center text-red-600 p-8">Error loading matches: {error}</div>
  }

  return (
    <div className="bg-[#0B1B32] text-white space-y-24">
      {/* Hero Section */}
      <section
        className="relative py-24 rounded-b-3xl bg-cover bg-center"
        style={{ backgroundImage: "url('/images/stadium-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-b-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight mb-6 text-white drop-shadow-lg">
              Experience Football Like Never Before
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-lg drop-shadow">
              Book your tickets online for the hottest football matches in Kenya.
              Secure your seat with M-Pesa and get instant digital tickets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/matches"
                className="bg-white/10 backdrop-blur-md text-white text-lg py-3 px-8 rounded-2xl border border-white/20 shadow-md hover:bg-white/20 transition"
              >
                View Matches
              </Link>
              <button
                onClick={scrollToHowItWorks}
                className="bg-[#83A6CE]/20 backdrop-blur-md border border-[#83A6CE]/40 text-white py-3 px-8 rounded-2xl font-medium hover:bg-[#83A6CE]/30 transition"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* Next Match Card */}
          <div
            className="rounded-3xl p-8 border border-white/20 shadow-xl"
            style={{
              background:
                'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <SportsSoccer className="h-8 w-8 text-white" />
              <h3 className="text-2xl font-semibold text-white">
                {nextMatch ? 'Next Big Match' : 'No Upcoming Matches'}
              </h3>
            </div>
            {nextMatch ? (
              <MatchCard match={nextMatch} variant="compact" />
            ) : (
              <div className="text-center py-8 text-gray-200">
                <SportsSoccer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Check back later for new fixtures</p>
                <Link
                  to="/matches"
                  className="inline-block mt-4 text-[#83A6CE] hover:text-[#A8C6EA] underline"
                >
                  View All Matches
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <StatsSection stats={dynamicStats} />
      <FeaturesSection />

      {/* Upcoming Matches */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-semibold text-white">Upcoming Matches</h2>
            <p className="text-white/70">Don't miss out on these exciting fixtures</p>
          </div>
          <Link to="/matches" className="text-[#83A6CE] font-medium hover:underline">
            View All Matches →
          </Link>
        </div>

        {upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-2xl shadow-md border border-white/20"
            style={{
              background:
                'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          >
            <SportsSoccer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Upcoming Matches
            </h3>
            <p className="text-[#83A6CE]">Check back later for new fixtures</p>
            <Link
              to="/matches"
              className="inline-block mt-4 text-[#83A6CE] hover:text-[#A8C6EA] underline"
            >
              View All Matches
            </Link>
          </div>
        )}
      </section>

      <HowItWorksSection ref={howItWorksRef} />
      <RealTimeNotice />
      <BackToTopButton />
    </div>
  )
}

export default React.memo(Home)