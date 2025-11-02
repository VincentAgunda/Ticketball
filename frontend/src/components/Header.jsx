import React, { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
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
  QrCodeScanner,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"

// --- START: Modified Motion Variants for Mobile Menu ---

// MODIFICATION 1:
// Changed transition from a 'spring' to a 'tween' (easeOut/easeIn).
// This feels "snappier" and less "bouncy," which can be perceived as less laggy.
const sidebarVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.3 } },
  exit: { x: "100%", transition: { type: "tween", ease: "easeIn", duration: 0.3 } },
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

// MODIFICATION 2:
// Changed animation from horizontal (x) to vertical (y).
// This stops the item animation from "fighting" the drawer's horizontal slide-in.
const itemVariants = {
  hidden: { opacity: 0, y: 20 }, // Was x: 20
  visible: { opacity: 1, y: 0 }, // Was x: 0
}
// --- END: Modified Motion Variants ---

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, signOut, isAdmin, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  // Close user menu when clicking outside
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
      setMobileMenuOpen(false) // Close mobile menu on sign out
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Smooth scroll helper with retry logic
  const scrollToId = (id) => {
    let attempts = 0
    const tryScroll = () => {
      attempts++
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
        return true
      }
      return false
    }
    if (!tryScroll()) {
      const interval = setInterval(() => {
        if (tryScroll() || attempts > 20) clearInterval(interval)
      }, 50)
    }
  }

  // Handles "News" button click for both desktop and mobile
  const handleNewsClick = () => {
    setMobileMenuOpen(false)
    if (location.pathname === "/") {
      scrollToId("news-section")
    } else {
      navigate("/", { state: { target: "news" } })
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
          </Link>

          {/* Desktop Nav */}
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
            <button
              onClick={handleNewsClick}
              className="text-sm font-medium px-2 py-1 rounded-md text-gray-700 hover:text-black transition-colors"
            >
              News
            </button>

            {isAdmin && (
              <Link
                to="/ticket-scanner"
                className="flex items-center px-3 py-1 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
              >
                <QrCodeScanner className="h-4 w-4 mr-1" />
                Scan Ticket
              </Link>
            )}
          </nav>

          {/* User Controls */}
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
                        <>
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Dashboard className="inline h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                          <Link
                            to="/ticket-scanner"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <QrCodeScanner className="inline h-4 w-4 mr-2" />
                            Ticket Scanner
                          </Link>
                        </>
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

          {/* --- START: Refactored Mobile Toggle --- */}
          {/* This button now animates from a hamburger to an 'X' */}
          <button
            className="md:hidden relative w-8 h-8 flex flex-col justify-between items-center p-2 z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span
              className={`block h-0.5 w-6 bg-gray-800 transform transition duration-300 ease-in-out ${
                mobileMenuOpen
                  ? "rotate-45 translate-y-[9px] bg-gray-800" // Use 9px for standard h-8
                  : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-gray-800 transition duration-300 ease-in-out ${
                mobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-gray-800 transform transition duration-300 ease-in-out ${
                mobileMenuOpen
                  ? "-rotate-45 -translate-y-[9px] bg-gray-800"
                  : ""
              }`}
            />
          </button>
          {/* --- END: Refactored Mobile Toggle --- */}
        </div>
      </div>

      {/* --- START: Refactored Mobile Drawer --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              // Use the modified sidebarVariants
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              // Add stopPropagation from target example
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-y-0 right-0 w-72 bg-white shadow-xl z-50 border-l border-gray-200 flex flex-col"
            >
              {/* Simplified Header - removed redundant close button */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Menu</span>
              </div>

              {/* Apply listVariants for staggered animation */}
              <motion.div
                className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Apply itemVariants to EACH link/button */}
                {navigation.map((item) => (
                  <motion.div key={item.name} variants={itemVariants}>
                    <Link
                      to={item.href}
                      // Apply new "modern" styling (larger text, more padding)
                      className={`block px-4 py-3 rounded-md text-lg font-medium ${
                        location.pathname === item.href
                          ? "text-black bg-gray-100"
                          : "text-gray-700 hover:text-black hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                <motion.div variants={itemVariants}>
                  <button
                    onClick={handleNewsClick}
                    className="block w-full text-left px-4 py-3 rounded-md text-lg font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  >
                    News
                  </button>
                </motion.div>

                {isAdmin && (
                  <motion.div variants={itemVariants}>
                    <Link
                      to="/ticket-scanner"
                      className="block px-4 py-3 rounded-md text-lg font-medium text-white bg-gray-800 hover:bg-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <QrCodeScanner className="inline h-5 w-5 mr-2" />
                      Ticket Scanner
                    </Link>
                  </motion.div>
                )}

                <div className="border-t border-gray-200 pt-3 mt-3">
                  {user ? (
                    <>
                      <motion.div
                        variants={itemVariants}
                        className="px-3 py-2 text-sm text-gray-900"
                      >
                        <div className="flex items-center space-x-2">
                          <AccountCircle />
                          <div>
                            <div className="font-medium truncate">
                              {user.email}
                            </div>
                            {isAdmin && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>

                      {isAdmin && (
                        <motion.div variants={itemVariants}>
                          <Link
                            to="/admin"
                            className="block px-4 py-3 rounded-md text-lg font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Dashboard className="inline h-5 w-5 mr-2" />
                            Admin Dashboard
                          </Link>
                        </motion.div>
                      )}

                      <motion.div variants={itemVariants}>
                        <Link
                          to="/my-tickets"
                          className="block px-4 py-3 rounded-md text-lg font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <SportsSoccer className="inline h-5 w-5 mr-2" />
                          My Tickets
                        </Link>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-3 rounded-md text-lg font-medium text-red-600 hover:bg-gray-50"
                        >
                          <ExitToApp className="inline h-5 w-5 mr-2" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div variants={itemVariants}>
                      <Link
                        to="/login"
                        className="block px-4 py-3 rounded-md text-lg font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Login className="inline h-5 w-5 mr-2 text-gray-600" />
                        Sign In
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* --- END: Refactored Mobile Drawer --- */}
    </motion.header>
  )
}

export default Header