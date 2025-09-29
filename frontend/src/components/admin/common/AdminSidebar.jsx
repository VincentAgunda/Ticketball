import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Dashboard,
  SportsSoccer,
  ConfirmationNumber,
  CalendarToday,
  ExitToApp,
  Close,
} from '@mui/icons-material'
import { useAuth } from '../../../context/AuthContext'

const AdminSidebar = ({ isOpen, onToggle }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: Dashboard },
    { path: '/admin/matches', label: 'Matches', icon: SportsSoccer },
    { path: '/admin/tickets', label: 'Tickets', icon: ConfirmationNumber },
    { path: '/admin/calendar', label: 'Calendar', icon: CalendarToday },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-[#DDDDDD]/90 backdrop-blur-xl
          border-r border-gray-300
          shadow-xl rounded-r-3xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-300/70">
          <div className="flex items-center space-x-3">
            <SportsSoccer className="h-8 w-8 text-[#0B1B32]" />
            <span className="text-lg font-semibold text-[#0B1B32]">Admin Panel</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 text-[#26415E] hover:text-[#0B1B32]"
          >
            <Close className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-5 border-b border-gray-300/70">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#83A6CE]/40 backdrop-blur-md rounded-full flex items-center justify-center text-[#0B1B32] font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-[#0B1B32]">{user?.email}</p>
              <p className="text-xs text-[#26415E]">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-5 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-2xl
                  transition-all duration-200
                  ${isActive
                    ? 'bg-white shadow-md text-[#0B1B32]'
                    : 'text-[#26415E] hover:bg-white/60 hover:text-[#0B1B32]'
                  }
                `}
                onClick={() => window.innerWidth < 1024 && onToggle()}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-gray-300/70">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-2xl
              text-red-600 hover:bg-red-100 hover:text-red-700
              transition-all"
          >
            <ExitToApp className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar
