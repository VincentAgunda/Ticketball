import React, { useMemo, useRef, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { SportsSoccer, ArrowUpward } from "@mui/icons-material"
import { useMatches } from "../../hooks/useFirebase"
import MatchCard from "../../components/MatchCard"
import { PageLoader } from "../../components/LoadingSpinner"
import { motion } from "framer-motion"

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

// ---- Stats Section ----
const StatsSection = React.memo(({ stats }) => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-10"
  >
    {stats.map((stat, index) => {
      const count = useCountUp(stat.number)
      return (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          className="text-center rounded-2xl p-6 shadow-lg border border-white/20 transition"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <div className="text-4xl font-bold text-white mb-2 drop-shadow">
            {count.toLocaleString()} {stat.label === "Satisfaction Rate" ? "%" : "+"}
          </div>
          <div className="text-white/80">{stat.label}</div>
        </motion.div>
      )
    })}
  </motion.section>
))

// ---- Players Section ----
const PlayersSection = React.memo(() => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-semibold mb-4 text-[#0B1B32]"
          >
            Our Top Players
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#0B1B32]/70 text-lg max-w-2xl mx-auto"
          >
            Meet some of the stars who make every match unforgettable.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="rounded-2xl bg-white shadow-xl hover:shadow-2xl transition overflow-hidden"
            >
              <img
                src="/images/player1.png"
                alt={`Player ${i}`}
                className="w-full h-64 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-[#0B1B32]">
                  Player {i}
                </h3>
                <p className="text-sm text-[#0B1B32]/70">
                  Forward • Jersey #{i}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})

// ---- How It Works ----
const HOW_IT_WORKS_STEPS = [
  { step: 1, title: "Select Match", text: "Choose from upcoming football matches and select your preferred seats" },
  { step: 2, title: "Pay with M-Pesa", text: "Complete payment securely using M-Pesa mobile money" },
  { step: 3, title: "Get Digital Ticket", text: "Receive QR code ticket instantly - show it at the gate" },
]

const HowItWorksSection = React.forwardRef((props, ref) => (
  <section
    ref={ref}
    className="relative py-20 rounded-3xl bg-cover bg-center"
    style={{ backgroundImage: "url('/images/hero1.png')" }}
  >
    <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-white drop-shadow-lg">
          How It Works
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {HOW_IT_WORKS_STEPS.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="text-center rounded-2xl p-8 shadow-lg border border-white/20 transition"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center mx-auto mb-6 text-lg font-bold shadow-inner">
              {item.step}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white drop-shadow">
              {item.title}
            </h3>
            <p className="text-white/80 text-sm">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
))

// ---- Real Time Notice ----
const RealTimeNotice = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8 }}
    className="fixed bottom-4 right-4 bg-green-100/80 border border-green-300/40 text-green-900 px-4 py-2 rounded-lg shadow-lg text-sm backdrop-blur-md"
  >
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>Live match data • Updated just now</span>
    </div>
  </motion.div>
))

// ---- Back to Top ----
const BackToTopButton = () => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  if (!visible) return null
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-5 bg-white/10 backdrop-blur-lg border border-white/20 text-white p-3 rounded-full shadow-lg hover:scale-110 transition"
    >
      <ArrowUpward />
    </motion.button>
  )
}

// ---- Main Home ----
const BASE_STATS = [
  { number: 50000, label: "Tickets Sold" },
  { number: 100, label: "Matches Hosted" },
  { number: 25000, label: "Happy Fans" },
  { number: 99, label: "Satisfaction Rate" },
]

const Home = () => {
  const { matches, loading, error } = useMatches()
  const howItWorksRef = useRef(null)

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" })
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
      { number: totalTicketsSold, label: "Tickets Sold" },
      { number: totalMatches, label: "Matches Hosted" },
      { number: totalTicketsSold, label: "Happy Fans" },
      { number: 99, label: "Satisfaction Rate" },
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
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative py-24 rounded-b-3xl bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero1.png')" }}
      >
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl font-semibold tracking-tight mb-6 text-[#0B1B32] drop-shadow-sm">
              Experience Football Like Never Before
            </h1>
            <p className="text-lg text-[#0B1B32]/80 mb-10 max-w-lg drop-shadow-sm">
              Book your tickets online for the hottest football matches in Kenya.
              Secure your seat with M-Pesa and get instant digital tickets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/matches"
                className="bg-white/10 backdrop-blur-md text-[#0B1B32] text-lg py-3 px-8 rounded-2xl border border-[#0B1B32]/20 shadow-md hover:bg-white/20 transition"
              >
                View Matches
              </Link>
              <button
                onClick={scrollToHowItWorks}
                className="bg-[#83A6CE]/20 backdrop-blur-md border border-[#83A6CE]/40 text-[#0B1B32] py-3 px-8 rounded-2xl font-medium hover:bg-[#83A6CE]/30 transition"
              >
                How It Works
              </button>
            </div>
          </motion.div>

          {/* Next Match */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl p-8 border border-white/20 shadow-xl"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <SportsSoccer className="h-8 w-8 text-white" />
              <h3 className="text-2xl font-semibold text-white">
                {nextMatch ? "Next Big Match" : "No Upcoming Matches"}
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
          </motion.div>
        </div>
      </motion.section>

      <StatsSection stats={dynamicStats} />
      <PlayersSection />

      {/* Upcoming Matches */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-6 lg:px-8"
      >
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
            {upcomingMatches.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
              >
                <MatchCard match={match} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-2xl shadow-md border border-white/20"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
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
      </motion.section>

      <HowItWorksSection ref={howItWorksRef} />
      <RealTimeNotice />
      <BackToTopButton />
    </div>
  )
}

export default React.memo(Home)
