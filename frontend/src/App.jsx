// src/App.jsx
import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Header from "./components/Header"
import Footer from "./components/Footer"

// Public pages
import Home from "./pages/public/Home"
import Matches from "./pages/public/Matches"
import News from "./pages/public/News"
import Booking from "./pages/public/Booking"
import FootballHero from "./pages/public/FootballHero"
import TicketDetails from "./pages/public/TicketDetails"
import VerifyTicket from "./pages/public/VerifyTicket"

// Auth-related pages
import Tickets from "./pages/public/Tickets"
import Login from "./pages/public/Login"
import Register from "./pages/public/Register"

// Admin & Scanner
import AdminLayout from "./pages/admin/AdminLayout"
import TicketScanner from "./pages/TicketScanner"

import "./styles/globals.css"

// -------------------
// Protected Route
// -------------------
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">
          Access denied. Admin privileges required.
        </div>
      </div>
    )
  }

  return children
}

// -------------------
// Public Route
// -------------------
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

// -------------------
// App Component
// -------------------
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-primary-light flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/news" element={<News />} />
            <Route path="/footballhero" element={<FootballHero />} />
            <Route path="/tickets/:ticketId" element={<TicketDetails />} />
            <Route path="/verify-ticket" element={<VerifyTicket />} />
            <Route path="/booking/:matchId" element={<Booking />} />

            {/* Auth routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* User protected routes */}
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute>
                  <Tickets />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            />

            {/* ✅ Ticket Scanner - protected route */}
            <Route
              path="/ticket-scanner"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <TicketScanner />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
