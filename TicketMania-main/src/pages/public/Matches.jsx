import React, { useState, useEffect } from 'react'
import {
  Search,
  FilterList,
  SportsSoccer,
} from '@mui/icons-material'
import { useMatches } from '../../hooks/useFirebase'
import MatchCard from '../../components/MatchCard'
import { PageLoader } from '../../components/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

const Matches = () => {
  const { matches, loading, error } = useMatches()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('upcoming')
  const [sortBy, setSortBy] = useState('date')
  const [filteredMatches, setFilteredMatches] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute to ensure real-time filtering
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (matches) {
      const filtered = matches.filter(match => {
        const matchesSearch = 
          match.home_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.away_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.venue?.toLowerCase().includes(searchTerm.toLowerCase())
        
        // Handle Firebase timestamp conversion
        const matchDate = match.match_date?.toDate ? match.match_date.toDate() : new Date(match.match_date)
        
        // Always filter out past matches regardless of dateFilter setting
        if (matchDate < currentTime) return false
        
        const matchesDate = 
          dateFilter === 'all' ? true :
          dateFilter === 'upcoming' ? true : // Already filtered past matches above
          dateFilter === 'today' ? matchDate.toDateString() === currentTime.toDateString() :
          dateFilter === 'week' ? (matchDate <= new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000)) :
          true
        
        return matchesSearch && matchesDate
      })

      const sorted = [...filtered].sort((a, b) => {
        // Handle Firebase timestamp conversion for sorting
        const aDate = a.match_date?.toDate ? a.match_date.toDate() : new Date(a.match_date)
        const bDate = b.match_date?.toDate ? b.match_date.toDate() : new Date(b.match_date)
        
        switch (sortBy) {
          case 'date':
            return aDate - bDate
          case 'price-low':
            return (a.ticket_price || 0) - (b.ticket_price || 0)
          case 'price-high':
            return (b.ticket_price || 0) - (a.ticket_price || 0)
          case 'availability':
            const aAvailability = (a.available_seats || 0) / (a.total_seats || 1)
            const bAvailability = (b.available_seats || 0) / (b.total_seats || 1)
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
      className="relative py-16 bg-cover bg-center min-h-screen"
      style={{
        backgroundImage: "url('/images/stadium-bg.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow mb-4">
            Upcoming Matches
          </h1>
          <p className="text-white/80 text-lg">
            Book your tickets for the most exciting football fixtures in Kenya
          </p>
          <div className="text-white/60 text-sm mt-2">
            Last updated: {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search matches by teams or venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full border border-gray-300 bg-white/70 backdrop-blur-sm py-2 pl-10 pr-4 focus:ring-2 focus:ring-[#0B1B32] focus:outline-none text-sm text-[#0B1B32]"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white/70 backdrop-blur-sm py-2 px-4 focus:ring-2 focus:ring-[#0B1B32] text-sm text-[#0B1B32]"
              >
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
                <option value="week">Next 7 Days</option>
                <option value="all">All Future Matches</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white/70 backdrop-blur-sm py-2 px-4 focus:ring-2 focus:ring-[#0B1B32] text-sm text-[#0B1B32]"
              >
                <option value="date">Sort by Date</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="availability">Availability</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center text-white/80">
          <p>
            Showing {filteredMatches.length}{' '}
            {filteredMatches.length === 1 ? 'match' : 'matches'}
            {matches && ` (${matches.length} total)`}
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <FilterList className="h-4 w-4" />
            <span>Filtered and sorted</span>
          </div>
        </div>

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMatches.map((match, index) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                shadeIndex={index}
                currentTime={currentTime}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <SportsSoccer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {matches?.length === 0 ? 'No Matches Available' : 'No Matches Found'}
            </h3>
            <p className="text-white/80 mb-6">
              {matches?.length === 0 
                ? 'Check back later for new fixtures' 
                : 'Try adjusting your search or filters'
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setDateFilter('upcoming')
                setSortBy('date')
              }}
              className="px-6 py-2 rounded-full font-medium bg-white/30 text-white backdrop-blur-md border border-white/50 hover:bg-white/40 transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Match Status Legend */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-6">
          <h4 className="font-semibold mb-4 text-white">Match Status Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/90">
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
        </div>
      </div>
    </section>
  )
}

export default Matches