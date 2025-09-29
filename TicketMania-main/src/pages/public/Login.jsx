import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SportsSoccer, Visibility, VisibilityOff } from '@mui/icons-material'
import { PageLoader } from '../../components/LoadingSpinner'

const Login = () => {
  const { user, userProfile, signIn, loading: authLoading, error: authError, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
    }
  }, [location.state])

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  useEffect(() => {
    if (user && userProfile) {
      const from = location.state?.from?.pathname || (userProfile.role === 'admin' ? '/admin' : '/')
      navigate(from, { replace: true })
    }
  }, [user, userProfile, navigate, location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    setSuccessMessage('')
    setIsLoggingIn(true)

    try {
      await signIn(email, password)
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (authLoading) {
    return <PageLoader />
  }

  if (user) {
    return <PageLoader />
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url('/images/stadium-bg.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative max-w-md w-full space-y-8 z-10">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <SportsSoccer className="h-12 w-12 text-[#83A6CE] drop-shadow" />
            <span className="text-3xl font-bold text-white drop-shadow">
              FootballTickets
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white drop-shadow">
            Sign In to Your Account
          </h2>
        </div>

        <form
          className="mt-8 space-y-6 bg-white/20 border border-white/30 backdrop-blur-xl shadow-2xl rounded-2xl p-8"
          onSubmit={handleSubmit}
        >
          {authError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {authError}
            </div>
          )}
          {successMessage && (
             <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm">
               {successMessage}
             </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
              Email Address
            </label>
            <input
              id="email" name="email" type="email" autoComplete="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/90 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#83A6CE] placeholder-gray-500 text-[#0B1B32]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password" name="password" type={showPassword ? 'text' : 'password'}
                autoComplete="current-password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#83A6CE] text-[#0B1B32] pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <VisibilityOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Visibility className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#83A6CE] text-[#0D1E4C] px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-white/90">
             Don't have an account?{' '}
             <Link to="/register" className="font-medium hover:underline text-white">
               Register here
             </Link>
           </p>
        </form>
      </div>
    </div>
  )
}

export default Login
