import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { NAVIGATION } from "../utils/constants"
import {
  SportsSoccer,
  Menu,
  Close,
  AccountCircle,
  ExitToApp,
  Dashboard,
  Login,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, signOut, isAdmin, loading } = useAuth()
  const location = useLocation()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  // Determine navigation based on user role
  const getNavigation = () => {
    if (loading) return NAVIGATION.public // Show public nav while loading
    
    if (user && isAdmin) {
      return NAVIGATION.admin
    } else if (user) {
      return NAVIGATION.public // You might want a 'user' specific nav
    } else {
      return NAVIGATION.public
    }
  }

  const navigation = getNavigation()

  const handleSignOut = async () => {
    try {
      await signOut()
      setMobileMenuOpen(false)
      setUserMenuOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  if (loading) {
    return (
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white text-brand-navy shadow-lg relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <SportsSoccer className="h-8 w-8 text-brand-navy" />
              <span className="text-xl font-bold">TicketCenter</span>
            </Link>
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </motion.header>
    )
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white text-brand-navy shadow-lg relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            >
              <SportsSoccer className="h-8 w-8 text-brand-navy" />
            </motion.div>
            <span className="text-xl font-bold">TicketCenter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "bg-brand-light text-brand-navy"
                    : "text-brand-navy hover:text-brand-teal hover:bg-brand-beige"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4 user-menu-container">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <AccountCircle className="h-6 w-6 text-brand-navy" />
                  <span className="text-sm text-brand-navy max-w-[150px] truncate">
                    {user.email}
                  </span>
                  {isAdmin && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                    >
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                        Signed in as
                        <div className="font-medium text-sm text-gray-700 truncate">
                          {user.email}
                        </div>
                        {isAdmin && (
                          <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded mt-1">
                            Administrator
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Dashboard className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/my-tickets"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <SportsSoccer className="h-4 w-4" />
                        <span>My Tickets</span>
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-100"
                      >
                        <ExitToApp className="h-4 w-4" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Sign In"
              >
                <Login className="h-6 w-6 text-brand-navy" />
                <span className="text-sm text-brand-navy hidden lg:inline">
                  Sign In
                </span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-brand-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.href
                      ? "bg-brand-light text-brand-navy"
                      : "text-brand-navy hover:text-brand-teal hover:bg-brand-beige"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-brand-navy">
                      <div className="flex items-center space-x-2">
                        <AccountCircle />
                        <div>
                          <div className="font-medium truncate">{user.email}</div>
                          {isAdmin && (
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-brand-navy bg-brand-light hover:bg-brand-beige"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Dashboard className="h-5 w-5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/my-tickets"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-brand-navy hover:bg-brand-beige"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <SportsSoccer className="h-5 w-5" />
                      <span>My Tickets</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100 border-t border-gray-200"
                    >
                      <ExitToApp className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-brand-navy hover:bg-brand-beige"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Login className="h-5 w-5 text-brand-navy" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header