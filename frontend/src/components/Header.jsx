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

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest(".user-menu-container")) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [userMenuOpen])

  const getNavigation = () => {
    if (loading) return NAVIGATION.public
    if (user && isAdmin) return NAVIGATION.admin
    if (user) return NAVIGATION.public
    return NAVIGATION.public
  }

  const navigation = getNavigation()

  const handleSignOut = async () => {
    try {
      await signOut()
      setUserMenuOpen(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white shadow-sm sticky top-0 z-50"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            >
              <SportsSoccer className="h-7 w-7 text-gray-800" />
            </motion.div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">
              TicketCenter
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium px-2 py-1 rounded-md transition-colors ${
                  location.pathname === item.href
                    ? "text-black"
                    : "text-gray-700 hover:text-black"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User / Auth Section */}
          <div className="hidden md:flex items-center space-x-4 user-menu-container">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <AccountCircle className="h-6 w-6 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                    {user.email}
                  </span>
                  {isAdmin && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100"
                    >
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                        Signed in as
                        <div className="font-medium text-sm text-gray-800 truncate">
                          {user.email}
                        </div>
                        {isAdmin && (
                          <span className="inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded mt-1">
                            Administrator
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Dashboard className="inline h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/my-tickets"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <SportsSoccer className="inline h-4 w-4 mr-2" />
                        My Tickets
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-50 border-t border-gray-100"
                      >
                        <ExitToApp className="inline h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
              >
                <Login className="h-5 w-5 text-gray-600" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Right-Side Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 w-72 bg-white shadow-xl z-50 rounded-l-2xl backdrop-blur-md border-l border-gray-200 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <Close />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.href
                      ? "text-black"
                      : "text-gray-700 hover:text-black hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-3">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <AccountCircle />
                        <div>
                          <div className="font-medium truncate">{user.email}</div>
                          {isAdmin && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Dashboard className="inline h-5 w-5 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/my-tickets"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <SportsSoccer className="inline h-5 w-5 mr-2" />
                      My Tickets
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                    >
                      <ExitToApp className="inline h-5 w-5 mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Login className="inline h-5 w-5 mr-2 text-gray-600" />
                    Sign In
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
