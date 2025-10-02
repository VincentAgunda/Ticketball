// src/pages/Matches.jsx
import React, { useState, useEffect } from "react"
import { Search, SportsSoccer, ConfirmationNumber } from "@mui/icons-material"
import { useMatches } from "../../hooks/useFirebase"
import MatchCard from "../../components/MatchCard"
import { PageLoader } from "../../components/LoadingSpinner"
import { motion } from "framer-motion"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

// ✅ Apple system font
const appleFont = {
  fontFamily:
    '"SF Pro Display","SF Pro Text",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
}

const Matches = () => {
  const { matches, loading, error } = useMatches()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("upcoming")
  const [sortBy, setSortBy] = useState("date")
  const [filteredMatches, setFilteredMatches] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Auto update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Filtering + sorting
  useEffect(() => {
    if (matches) {
      const filtered = matches.filter((match) => {
        const matchesSearch =
          match.home_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.away_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.venue?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchDate = match.match_date?.toDate
          ? match.match_date.toDate()
          : new Date(match.match_date)

        if (dateFilter !== "all" && matchDate < currentTime) return false

        const matchesDate =
          dateFilter === "all"
            ? true
            : dateFilter === "upcoming"
            ? matchDate >= currentTime
            : dateFilter === "today"
            ? matchDate.toDateString() === currentTime.toDateString()
            : dateFilter === "week"
            ? matchDate <=
              new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000)
            : true

        return matchesSearch && matchesDate
      })

      const sorted = [...filtered].sort((a, b) => {
        const aDate = a.match_date?.toDate
          ? a.match_date.toDate()
          : new Date(a.match_date)
        const bDate = b.match_date?.toDate
          ? b.match_date.toDate()
          : new Date(b.match_date)

        switch (sortBy) {
          case "date":
            return aDate - bDate
          case "price-low":
            return (a.ticket_price || 0) - (b.ticket_price || 0)
          case "price-high":
            return (b.ticket_price || 0) - (a.ticket_price || 0)
          case "availability":
            const aAvailability =
              (a.available_seats || 0) / (a.total_seats || 1)
            const bAvailability =
              (b.available_seats || 0) / (b.total_seats || 1)
            return bAvailability - aAvailability
          default:
            return 0
        }
      })

      setFilteredMatches(sorted)
    }
  }, [matches, searchTerm, dateFilter, sortBy, currentTime])

  if (loading) return <PageLoader />
  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        Error loading matches: {error}
      </div>
    )
  }

  return (
    <section
      className="relative w-full min-h-screen bg-[#f5f5f7] py-20"
      style={appleFont}
    >
      {/* Header */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-semibold tracking-tight mb-4">
          Upcoming Matches
        </h1>
        <p className="text-lg text-gray-600">
          Book your seats for Kenya’s most exciting football fixtures
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Last updated: {currentTime.toLocaleTimeString()}
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-[#15291c] rounded-3xl shadow-md border border-gray-700 p-6 text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search matches by team or venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full border border-gray-500 bg-[#1f3a29] text-white placeholder-gray-400 py-2 pl-10 pr-4 focus:ring-2 focus:ring-green-400 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-full border border-gray-500 bg-[#1f3a29] text-white py-2 px-4 focus:ring-2 focus:ring-green-400 text-sm"
              >
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
                <option value="week">Next 7 Days</option>
                <option value="all">All Matches</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-full border border-gray-500 bg-[#1f3a29] text-white py-2 px-4 focus:ring-2 focus:ring-green-400 text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="availability">Availability</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Count + Tickets */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-gray-700 gap-4">
          <p>
            Showing {filteredMatches.length}{" "}
            {filteredMatches.length === 1 ? "match" : "matches"}{" "}
            {matches && `(${matches.length} total)`}
          </p>

          <button
            onClick={() => (user ? navigate("/tickets") : navigate("/login"))}
            className="flex items-center gap-2 px-5 py-2 rounded-full font-medium 
                       bg-black text-white hover:bg-gray-900 transition"
          >
            <ConfirmationNumber className="h-5 w-5" />
            My Tickets
          </button>
        </div>

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6 }}
              >
                <MatchCard
                  match={match}
                  shadeIndex={index}
                  currentTime={currentTime}
                  allowGuestBooking={true}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <SportsSoccer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {matches?.length === 0
                ? "No Matches Available"
                : "No Matches Found"}
            </h3>
            <p className="text-gray-500 mb-6">
              {matches?.length === 0
                ? "Check back later for new fixtures"
                : "Try adjusting your filters"}
            </p>
            <button
              onClick={() => {
                setSearchTerm("")
                setDateFilter("upcoming")
                setSortBy("date")
              }}
              className="px-6 py-2 rounded-full font-medium bg-gray-900 text-white hover:bg-black transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Status Legend */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white/60 backdrop-blur-xl border border-gray-200 rounded-2xl p-6"
        >
          <h4 className="font-semibold mb-4 text-gray-900">
            Match Status Legend
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Available - Plenty of seats left</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span>Limited - Few seats remaining</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Sold Out - No seats available</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Matches
