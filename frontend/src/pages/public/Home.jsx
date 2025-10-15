// src/pages/public/Home.jsx
import React, { useMemo, useRef, Suspense, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { SportsSoccer, ArrowUpward } from "@mui/icons-material"
import { motion } from "framer-motion"
import { useMatches } from "../../hooks/useFirebase"
import MatchCard from "../../components/MatchCard"
import FootballHero from "./FootballHero"
import PageLoader from "../../components/LoadingSpinner" // lazy handled below via Suspense

import "./Home.css"

// lazy load heavier/secondary sections to cut initial bundle
const TalentsSection = React.lazy(() => import("./TalentsSection"))
const EventsMemoriesSection = React.lazy(() => import("./EventsMemoriesSection"))
const News = React.lazy(() => import("./News"))
const CallToAction = React.lazy(() => import("./CallToAction"))

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

// Prefers reduced motion hook
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener?.("change", handler)
    return () => mq.removeEventListener?.("change", handler)
  }, [])
  return prefersReducedMotion
}

// Logos marquee - CSS-driven (GPU-friendly)
const LogosSection = React.memo(() => {
  const prefersReducedMotion = usePrefersReducedMotion()

  // Preload images (cheap)
  useEffect(() => {
    teamLogos.forEach((t) => {
      const img = new Image()
      img.src = t.image
    })
  }, [])

  // duplicate logos for smooth continuous marquee
  const marqueeItems = useMemo(() => [...teamLogos, ...teamLogos], [])

  return (
    <section className="py-12 bg-[#f5f5f7] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#0B1B32]">Teams We Host</h2>
      </div>

      <div className="marquee-wrapper" aria-hidden={prefersReducedMotion}>
        <div
          className={`marquee-track ${prefersReducedMotion ? "marquee-paused" : ""}`}
          role="list"
        >
          {marqueeItems.map((team, i) => (
            <div key={i} className="marquee-item" role="listitem">
              <img
                src={team.image}
                alt={`team-${team.id}`}
                className="marquee-img"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

const RealTimeNotice = React.memo(() => (
  <div className="fixed-notice" aria-live="polite">
    <div className="flex items-center space-x-2">
      <div className="live-dot" />
      <span>Live match data • Updated just now</span>
    </div>
  </div>
))

const BackToTopButton = () => {
  const [visible, setVisible] = React.useState(false)
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="back-to-top"
      aria-label="Back to top"
    >
      <ArrowUpward />
    </button>
  )
}

const Home = () => {
  const { matches, loading, error } = useMatches()
  const howItWorksRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const upcomingMatches = useMemo(() => {
    if (!matches) return []
    const now = Date.now()
    return matches
      .filter((match) => {
        const matchDateRaw = match.match_date?.toDate?.() || match.match_date
        return new Date(matchDateRaw).getTime() > now
      })
      .sort((a, b) => {
        const dateA = new Date(a.match_date?.toDate?.() || a.match_date).getTime()
        const dateB = new Date(b.match_date?.toDate?.() || b.match_date).getTime()
        return dateA - dateB
      })
      .slice(0, 6)
  }, [matches])

  const nextMatch = upcomingMatches[0] || null

  // Keep a single, short fade in on entry for hero container (lightweight)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [])

  useEffect(() => {
    if (location?.state?.target === "news") {
      // robust scroll attempt, but keep light
      let attempts = 0
      const tryScroll = () => {
        attempts++
        const el = document.getElementById("news-section")
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
          navigate(location.pathname, { replace: true, state: {} })
          return true
        }
        return false
      }
      if (!tryScroll()) {
        const interval = setInterval(() => {
          if (tryScroll() || attempts > 20) clearInterval(interval)
        }, 50)
        return () => clearInterval(interval)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state?.target])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
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
        transition={{ duration: 0.6 }}
        className="relative py-24 md:py-28 bg-hero overflow-hidden"
        aria-label="Hero: Experience Football"
      >
        <div className="hero-overlay" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.12 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4 text-white">
              Experience Football Like Never Before
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-6 max-w-lg leading-relaxed">
              Book your tickets online for the hottest football matches in Kenya. Secure your seat with M-Pesa and get instant digital tickets.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/matches" className="btn-primary">View Matches</Link>
              <button
                onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="btn-secondary"
              >
                Memories
              </button>
            </div>
          </motion.div>

          <div className="rounded-2xl p-6 bg-white shadow-xl border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <SportsSoccer className="h-7 w-7 text-[#0B1B32]" />
              <h3 className="text-xl font-semibold text-[#0B1B32]">{nextMatch ? "Next Big Match" : "No Upcoming Matches"}</h3>
            </div>
            {nextMatch ? (
              <MatchCard match={nextMatch} variant="compact" />
            ) : (
              <div className="text-center py-8 text-gray-600">
                <SportsSoccer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Check back later for new fixtures</p>
                <Link to="/matches" className="inline-block mt-3 text-[#83A6CE] hover:text-[#6d8db4] underline">View All Matches</Link>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      <LogosSection />

      {/* lazy-loaded sections to reduce initial bundle */}
      <Suspense fallback={<div className="min-h-40 flex items-center justify-center">Loading…</div>}>
        <TalentsSection />
      </Suspense>

      {/* Upcoming Matches */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0B1B32]">Upcoming Matches</h2>
          <Link to="/matches" className="text-[#83A6CE] hover:text-[#6d8db4] font-medium">View All</Link>
        </div>

        {upcomingMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map((match) => (
              <div key={match.id} className="match-card-wrapper">
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">No upcoming matches at the moment.</div>
        )}
      </section>

      <FootballHero />

      {/* wrap the lazy EventsMemoriesSection in a real DOM wrapper and attach ref there */}
      <div ref={howItWorksRef}>
        <Suspense fallback={<div className="min-h-40 flex items-center justify-center">Loading…</div>}>
          <EventsMemoriesSection />
        </Suspense>
      </div>

      <section id="news-section" className="max-w-7xl mx-auto px-6 lg:px-8">
        <Suspense fallback={<div className="min-h-40 flex items-center justify-center">Loading…</div>}>
          <News />
        </Suspense>
      </section>

      <Suspense fallback={null}>
        <CallToAction />
      </Suspense>

      <RealTimeNotice />
      <BackToTopButton />
    </div>
  )
}

export default Home
