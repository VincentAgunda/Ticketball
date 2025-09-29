import React, { useState, useEffect } from 'react'
import { 
  SportsSoccer,
  ConfirmationNumber,
  AttachMoney,
  People,
  TrendingUp,
  EventAvailable
} from '@mui/icons-material'
import { formatCurrency } from '../../../utils/helpers'
import { useMatches, useAllTickets } from '../../../hooks/useFirebase'
import { PageLoader } from '../../../components/LoadingSpinner'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalTickets: 0,
    totalRevenue: 0,
    activeUsers: 0,
    todaySales: 0,
    availableSeats: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { matches, loading: matchesLoading } = useMatches()
  const { tickets, loading: ticketsLoading } = useAllTickets()

  useEffect(() => {
    if (!matchesLoading && !ticketsLoading) {
      calculateStats()
    }
  }, [matches, tickets, matchesLoading, ticketsLoading])

  const calculateStats = () => {
    try {
      const totalMatches = matches?.length || 0
      const totalTickets = tickets?.length || 0
      const totalRevenue = tickets?.reduce((sum, ticket) => sum + (ticket.price || 0), 0) || 0
      const availableSeats = matches?.reduce((sum, match) => sum + (match.available_seats || 0), 0) || 0
      
      // Today's sales
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todaySales = tickets?.filter(ticket => {
        const ticketDate = ticket.created_at?.toDate?.() || ticket.created_at
        return new Date(ticketDate) >= todayStart
      }).reduce((sum, ticket) => sum + (ticket.price || 0), 0) || 0

      setStats({
        totalMatches,
        totalTickets,
        totalRevenue,
        activeUsers: 0, // You can implement user counting separately
        todaySales,
        availableSeats
      })

      // Generate recent activities
      const activities = generateRecentActivities(tickets, matches)
      setRecentActivities(activities)
      setLoading(false)

    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Error calculating stats:', err)
      setLoading(false)
    }
  }

  const generateRecentActivities = (tickets = [], matches = []) => {
    const activities = []
    
    // Add ticket sales as activities
    const recentTickets = tickets
      .sort((a, b) => {
        const dateA = a.created_at?.toDate?.() || a.created_at
        const dateB = b.created_at?.toDate?.() || b.created_at
        return new Date(dateB) - new Date(dateA)
      })
      .slice(0, 4)

    recentTickets.forEach(ticket => {
      const match = matches.find(m => m.id === ticket.match_id)
      activities.push({
        id: ticket.id,
        action: 'Ticket Sale',
        details: match ? `Ticket for ${match.home_team} vs ${match.away_team}` : 'Ticket purchase',
        time: formatTime(ticket.created_at),
        amount: ticket.price
      })
    })

    // Add match creations as activities
    const recentMatches = matches
      .sort((a, b) => {
        const dateA = a.created_at?.toDate?.() || a.created_at
        const dateB = b.created_at?.toDate?.() || b.created_at
        return new Date(dateB) - new Date(dateA)
      })
      .slice(0, 2)

    recentMatches.forEach(match => {
      activities.push({
        id: match.id,
        action: 'Match Added',
        details: `${match.home_team} vs ${match.away_team}`,
        time: formatTime(match.created_at)
      })
    })

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Recently'
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  const StatCard = ({ icon: Icon, title, value, subtitle }) => (
    <div className="rounded-2xl shadow-sm border border-gray-200 bg-[#ffffff] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl bg-[#ebf0f6]">
          <Icon className="h-6 w-6 text-gray-700" />
        </div>
      </div>
    </div>
  )

  if (loading) return <PageLoader />
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>

  return (
    <div className="space-y-8 bg-[#f5f4f0] min-h-screen p-6 rounded-lg">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your administration panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={SportsSoccer}
          title="Total Matches"
          value={stats.totalMatches}
          subtitle="This season"
        />
        <StatCard
          icon={ConfirmationNumber}
          title="Tickets Sold"
          value={stats.totalTickets.toLocaleString()}
          subtitle="All matches"
        />
        <StatCard
          icon={AttachMoney}
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="KES"
        />
        <StatCard
          icon={People}
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          subtitle="Registered users"
        />
        <StatCard
          icon={TrendingUp}
          title="Today's Sales"
          value={formatCurrency(stats.todaySales)}
          subtitle="Today"
        />
        <StatCard
          icon={EventAvailable}
          title="Available Seats"
          value={stats.availableSeats.toLocaleString()}
          subtitle="Across all matches"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-2xl shadow-sm border border-gray-200 bg-[#ffffff] p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#9d174d] rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">{activity.action}</span>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  {activity.amount && (
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(activity.amount)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl shadow-sm border border-gray-200 bg-[#ffffff] p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/matches'}
              className="p-4 rounded-xl bg-[#f4f3ef] hover:bg-[#ebf0f6] transition-colors text-left"
            >
              <SportsSoccer className="h-6 w-6 mb-2 text-gray-700" />
              <p className="font-medium text-gray-800">Add Match</p>
              <p className="text-sm text-gray-600">Create new fixture</p>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/tickets'}
              className="p-4 rounded-xl bg-[#f4f3ef] hover:bg-[#ebf0f6] transition-colors text-left"
            >
              <ConfirmationNumber className="h-6 w-6 mb-2 text-gray-700" />
              <p className="font-medium text-gray-800">View Tickets</p>
              <p className="text-sm text-gray-600">Manage bookings</p>
            </button>
            <button className="p-4 rounded-xl bg-[#f4f3ef] hover:bg-[#ebf0f6] transition-colors text-left">
              <AttachMoney className="h-6 w-6 mb-2 text-gray-700" />
              <p className="font-medium text-gray-800">Sales Report</p>
              <p className="text-sm text-gray-600">Generate report</p>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/calendar'}
              className="p-4 rounded-xl bg-[#f4f3ef] hover:bg-[#ebf0f6] transition-colors text-left"
            >
              <People className="h-6 w-6 mb-2 text-gray-700" />
              <p className="font-medium text-gray-800">Calendar</p>
              <p className="text-sm text-gray-600">View schedule</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard