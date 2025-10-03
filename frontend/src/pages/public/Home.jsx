// src/pages/public/Home.jsx
import React, { useMemo, useRef, Suspense } from "react"
import { Link } from "react-router-dom"
import { SportsSoccer, ArrowUpward } from "@mui/icons-material"
import { motion } from "framer-motion"
import { useMatches } from "../../hooks/useFirebase"
import News from "./News"
import FootballHero from "./FootballHero"
import TalentsSection from "./TalentsSection"
import EventsMemoriesSection from "./EventsMemoriesSection"
import CallToAction from "./CallToAction"


// Lazy-load heavy components to speed initial paint
const MatchCard = React.lazy(() => import("../../components/MatchCard"))
const PageLoader = React.lazy(() =>
  import("../../components/LoadingSpinner").then((m) => ({ default: m.PageLoader || m.default }))
)

// ---------- Data (keep routes as-is) ----------
const teamLogos = [
  { id: 1, image: "/images/how-it-works-bg.jpg" },
  { id: 2, image: "/images/afc.png" },
  { id: 3, image: "/images/afc.png" },
  { id: 4, image: "/images/gor.png" },
  { id: 5, image: "/images/sofa.png" },
  { id: 6, image: "/images/how-it-works-bg.jpg" },
  { id: 7, image: "/images/banda.png" },
  { id: 8, image: "/images/how-it-works-bg.jpg" },
]

// ---------- Utility: respect reduced motion ----------
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener?.("change", handler)
    return () => mq.removeEventListener?.("change", handler)
  }, [])
  return prefersReducedMotion
}

// ---------- Logos Section (memoized) ----------
const LogosSection = React.memo(() => {
  const prefersReducedMotion = usePrefersReducedMotion()

  // Preload images for the carousel (small improvement)
  React.useEffect(() => {
    teamLogos.forEach((t) => {
      const img = new Image()
      img.src = t.image
    })
  }, [])

  return (
    <section className="py-12 bg-[#f5f5f7] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-semibold text-[#0B1B32]"
        >
          Teams We Host
        </motion.h2>
      </div>

      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-8 w-max px-6"
          animate={prefersReducedMotion ? {} : { x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {[...teamLogos, ...teamLogos].map((team, i) => (
            <div key={i} className="w-28 h-28 flex-shrink-0 rounded-2xl shadow-sm bg-white overflow-hidden">
              <img src={team.image} alt={`team-${team.id}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
})

// ---------- Small Live Notice ----------
const RealTimeNotice = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
    aria-live="polite"
  >
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <span>Live match data • Updated just now</span>
    </div>
  </motion.div>
))

// ---------- Back To Top ----------
const BackToTopButton = () => {
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
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
      className="fixed bottom-20 right-5 bg-[#0B1B32] text-white p-3 rounded-full shadow-lg hover:scale-110 transition"
      aria-label="Back to top"
    >
      <ArrowUpward />
    </motion.button>
  )
}

// ---------- Main Home Component ----------
const Home = () => {
  const { matches, loading, error } = useMatches()
  const howItWorksRef = useRef(null)

  // Filter and sort upcoming matches (stable & memoized)
  const upcomingMatches = useMemo(() => {
    if (!matches) return []
    const now = Date.now()
    return matches
      .map((m) => ({ ...m }))
      .filter((match) => {
        const matchDateRaw = match.match_date?.toDate?.() || match.match_date
        const matchTs = new Date(matchDateRaw).getTime()
        return matchTs > now
      })
      .sort((a, b) => {
        const dateA = new Date(a.match_date?.toDate?.() || a.match_date).getTime()
        const dateB = new Date(b.match_date?.toDate?.() || b.match_date).getTime()
        return dateA - dateB
      })
      .slice(0, 6)
  }, [matches])

  const nextMatch = upcomingMatches[0] || null

  if (loading) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
        <PageLoader />
      </Suspense>
    )
  }

  if (error) {
    return <div className="text-center text-red-600 p-8">Error loading matches: {String(error)}</div>
  }

  return (
    <div className="bg-white text-[#0B1B32] space-y-20 font-sans antialiased">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-24 md:py-28 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/images/hero1.png')" }}
        aria-label="Hero: Experience Football"
      >
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4 text-white"
            >
              Experience Football Like Never Before
            </motion.h1>

            <motion.p
              initial={{ y: 12, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="text-base md:text-lg text-white/90 mb-6 max-w-lg leading-relaxed"
            >
              Book your tickets online for the hottest football matches in Kenya. Secure your seat with M-Pesa and get instant digital tickets.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/matches" className="bg-[#15291c] text-white text-lg py-3 px-6 rounded-md shadow-md hover:bg-[#0b2631] transition">
                View Matches
              </Link>
              <button
                onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="bg-white text-[#0B1B32] py-3 px-6 rounded-md font-medium shadow hover:bg-gray-100 transition"
              >
                Memories
              </button>
            </div>
          </motion.div>

          {/* Right - Next Match */}
          <motion.div
            initial={{ x: 24, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="rounded-2xl p-6 bg-white shadow-xl border border-gray-100"
          >
            <div className="flex items-center space-x-3 mb-4">
              <SportsSoccer className="h-7 w-7 text-[#0B1B32]" />
              <h3 className="text-xl font-semibold text-[#0B1B32]">{nextMatch ? "Next Big Match" : "No Upcoming Matches"}</h3>
            </div>

            {nextMatch ? (
              <Suspense fallback={<div>Loading match…</div>}>
                <MatchCard match={nextMatch} variant="compact" />
              </Suspense>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <SportsSoccer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Check back later for new fixtures</p>
                <Link to="/matches" className="inline-block mt-3 text-[#83A6CE] hover:text-[#6d8db4] underline">
                  View All Matches
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Lightweight sections */}
      <LogosSection />
      <TalentsSection />

      {/* Upcoming Matches */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-6 lg:px-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0B1B32]">Upcoming Matches</h2>
          <Link to="/matches" className="text-[#83A6CE] hover:text-[#6d8db4] font-medium">
            View All
          </Link>
        </div>

        {upcomingMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map((match, idx) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: idx * 0.04 }}>
                <Suspense fallback={<div className="p-6">Loading…</div>}>
                  <MatchCard match={match} />
                </Suspense>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">No upcoming matches at the moment.</div>
        )}
      </motion.section>

      <FootballHero />

      <EventsMemoriesSection ref={howItWorksRef} />
      <News />
      <CallToAction />   {/* ✅ New Section */}

      <RealTimeNotice />
      <BackToTopButton />
    </div>
  )
}

export default Home
