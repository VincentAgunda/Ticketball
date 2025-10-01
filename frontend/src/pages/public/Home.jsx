import React, { useMemo, useRef, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { SportsSoccer, ArrowUpward } from "@mui/icons-material"
import { useMatches } from "../../hooks/useFirebase"
import MatchCard from "../../components/MatchCard"
import { PageLoader } from "../../components/LoadingSpinner"
import { motion } from "framer-motion"
import { Plus, ChevronsLeft, ChevronsRight } from "lucide-react"

// ---- Team Logos (replace stats) ----
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

// ---- Logos Carousel Section ----
const LogosSection = React.memo(() => {
  return (
    <section className="py-16 bg-[#f5f5f7] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-semibold text-[#0B1B32]"
        >
          Teams We Host
        </motion.h2>
      </div>

      {/* Auto-scrolling logos */}
      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-12 w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        >
          {[...teamLogos, ...teamLogos].map((team, i) => (
            <div
              key={i}
              className="w-28 h-28 flex-shrink-0 rounded-2xl shadow-lg bg-white overflow-hidden"
            >
              <img
                src={team.image}
                alt="team logo"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
})

// ---- Players Section ----
const players = [
  { id: 1, name: "John Doe", role: "Forward", image: "/images/player3.png" },
  { id: 2, name: "David Smith", role: "Goalkeeper", image: "/images/player2.png" },
  { id: 3, name: "Chris Johnson", role: "Midfielder", image: "/images/how-it-works1-bg.png" },
  { id: 4, name: "Michael Lee", role: "Defender", image: "/images/player2.png" },
  { id: 5, name: "Samuel King", role: "Winger", image: "/images/player3.png" },
  { id: 6, name: "Alex Carter", role: "Striker", image: "/images/how-it-works1-bg.png" },
  { id: 7, name: "Ryan Brooks", role: "Midfielder", image: "/images/player2.png" },
]

const PlayersSection = React.memo(() => {
  const carouselRef = useRef(null)
  const [active, setActive] = useState(0)

  const scrollToIndex = (index) => {
    const el = carouselRef.current
    if (!el) return
    const card = el.querySelector("[data-snap]")
    if (!card) return
    const cardWidth = card.getBoundingClientRect().width
    const gap = parseFloat(getComputedStyle(el).columnGap || 24) || 24
    const scrollLeft = index * (cardWidth + gap)
    el.scrollTo({ left: scrollLeft, behavior: "smooth" })
  }

  const handlePrev = () => scrollToIndex(Math.max(0, active - 1))
  const handleNext = () => scrollToIndex(Math.min(players.length - 1, active + 1))

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const onScroll = () => {
      const card = el.querySelector("[data-snap]")
      if (!card) return
      const cardWidth = card.getBoundingClientRect().width
      const gap = parseFloat(getComputedStyle(el).columnGap || 24) || 24
      const index = Math.round(el.scrollLeft / (cardWidth + gap))
      setActive(index)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section className="py-24 bg-[#f5f5f7] font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-semibold mb-2 text-[#0B1B32]"
          >
            Our Top Players
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#0B1B32]/70 text-base md:text-lg max-w-2xl mx-auto"
          >
            Meet some of the stars who make every match unforgettable.
          </motion.p>
        </div>

        <div className="relative">
          <div
            ref={carouselRef}
            className="overflow-x-auto scrollbar-none snap-x snap-mandatory grid auto-cols-[minmax(260px,1fr)] grid-flow-col gap-6 py-6"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {players.map((player, i) => (
              <motion.div
                key={player.id}
                data-snap
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="snap-center relative rounded-3xl overflow-hidden h-[420px] flex flex-col justify-end group"
                style={{
                  backgroundImage: `url(${player.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent pointer-events-none"></div>
                <div className="p-6 relative z-10">
                  <p className="text-sm text-white/80">{player.role}</p>
                  <h3 className="text-2xl md:text-3xl font-semibold text-white">
                    {player.name}
                  </h3>
                </div>
                <button
                  aria-label={`View ${player.name}`}
                  className="absolute bottom-6 right-6 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                >
                  <Plus size={18} />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center space-x-4">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-105 transition"
              aria-label="Previous players"
            >
              <ChevronsLeft size={18} />
            </button>
            <div className="flex items-center space-x-2 px-3 py-2 bg-white/90 rounded-full shadow-md">
              {players.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  className={`w-2 h-2 rounded-full ${
                    idx === active ? "bg-[#0B1B32]" : "bg-gray-300"
                  }`}
                  aria-label={`Go to player ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-105 transition"
              aria-label="Next players"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
})

// ---- Portfolio Memories Section ----
const portfolioMemories = [
  { id: 1, image: "/images/how-it-works-bg.jpg", caption: "Championship Glory" },
  { id: 2, image: "/images/home1.png", caption: "Fans in Action" },
  { id: 3, image: "/images/home1.png", caption: "Team Spirit" },
  { id: 4, image: "/images/how-it-works1-bg.png", caption: "Historic Goal" },
  { id: 5, image: "/images/how-it-works1-bg.png", caption: "Celebrations" },
  { id: 6, image: "/images/how-it-works-bg.jpg", caption: "Iconic Moments" },
   { id: 7, image: "/images/player2.png", caption: "Historic Goal" },
  { id: 8, image: "/images/player3.png", caption: "Celebrations" },
  { id: 9, image: "/images/how-it-works-bg.jpg", caption: "Iconic Moments" },

]

const PortfolioMemoriesSection = React.forwardRef((props, ref) => (
  <section ref={ref} className="py-24 bg-[#f5f5f7]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-semibold text-[#0B1B32]"
        >
          Portfolio Memories
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[#0B1B32]/70 text-base md:text-lg max-w-2xl mx-auto"
        >
          Relive the unforgettable moments from our matches and events.
        </motion.p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {portfolioMemories.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="relative group rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src={item.image}
              alt={item.caption}
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
              <p className="text-white text-lg font-medium">{item.caption}</p>
            </div>
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
    className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
  >
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
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
      className="fixed bottom-20 right-5 bg-[#0B1B32] text-white p-3 rounded-full shadow-lg hover:scale-110 transition"
    >
      <ArrowUpward />
    </motion.button>
  )
}

// ---- Main Home ----
const Home = () => {
  const { matches, loading, error } = useMatches()
  const howItWorksRef = useRef(null)

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

  const nextMatch = upcomingMatches[0] || null

  if (loading) return <PageLoader />
  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        Error loading matches: {error}
      </div>
    )
  }

  return (
    <div className="bg-white text-[#0B1B32] space-y-24 font-sans">
 {/* Hero Section */}
<motion.section
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative py-28 md:py-32 bg-cover bg-center overflow-hidden"
  style={{ backgroundImage: "url('/images/hero1.png')" }}
>
  {/* Overlay for Apple-style premium look */}
  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

  <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
    {/* Left Section: Headline */}
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-white"
      >
        Experience Football Like Never Before
      </motion.h1>

      <motion.p
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-base md:text-lg text-white/90 mb-8 max-w-lg leading-relaxed"
      >
        Book your tickets online for the hottest football matches in Kenya.  
        Secure your seat with M-Pesa and get instant digital tickets.
      </motion.p>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link
          to="/matches"
          className="bg-[#15291c] text-white text-lg py-3 px-8 rounded-md shadow-md hover:bg-[#0b2631] transition"
        >
          View Matches
        </Link>
        <button
          onClick={() =>
            howItWorksRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          className="bg-white text-[#0B1B32] py-3 px-8 rounded-md font-medium shadow hover:bg-gray-100 transition"
        >
          Memories
        </button>
      </motion.div>
    </motion.div>

    {/* Right Section: Next Match Card */}
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      className="rounded-3xl p-8 bg-white shadow-xl border border-gray-100"
    >
      <div className="flex items-center space-x-3 mb-6">
        <SportsSoccer className="h-8 w-8 text-[#0B1B32]" />
        <h3 className="text-2xl font-semibold text-[#0B1B32]">
          {nextMatch ? "Next Big Match" : "No Upcoming Matches"}
        </h3>
      </div>
      {nextMatch ? (
        <MatchCard match={nextMatch} variant="compact" />
      ) : (
        <div className="text-center py-8 text-gray-600">
          <SportsSoccer className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Check back later for new fixtures</p>
          <Link
            to="/matches"
            className="inline-block mt-4 text-[#83A6CE] hover:text-[#6d8db4] underline"
          >
            View All Matches
          </Link>
        </div>
      )}
    </motion.div>
  </div>
</motion.section>

<LogosSection />
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
          <h2 className="text-3xl md:text-4xl font-semibold text-[#0B1B32]">
            Upcoming Matches
          </h2>
          <Link
            to="/matches"
            className="text-[#83A6CE] hover:text-[#6d8db4] font-medium"
          >
            View All
          </Link>
        </div>
        {upcomingMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <MatchCard match={match} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p>No upcoming matches at the moment.</p>
          </div>
        )}
      </motion.section>

      <PortfolioMemoriesSection ref={howItWorksRef} />
      <RealTimeNotice />
      <BackToTopButton />
    </div>
  )
}

export default Home
