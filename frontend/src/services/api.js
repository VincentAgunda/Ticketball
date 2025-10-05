import axios from 'axios'

// ✅ Always ensure the base URL ends cleanly and includes /api
const rawBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000'
const API_BASE_URL = `${rawBase}/api`

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

// ✅ Request interceptor (attach Firebase token if available)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('firebaseToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Response interceptor (uniform error logging)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

/* -------------------------------------------------------------------------- */
/* 💳 M-PESA SERVICE                                                          */
/* -------------------------------------------------------------------------- */
export const mpesaService = {
  initiatePayment: async (paymentData) => {
    try {
      const response = await api.post('/mpesa/stk-push', paymentData)
      return response.data
    } catch (error) {
      console.error('M-Pesa payment initiation error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'Payment initiation failed',
      }
    }
  },

  checkPaymentStatus: async (checkoutRequestId) => {
    try {
      const response = await api.get(`/mpesa/check-payment?checkoutRequestId=${checkoutRequestId}`)
      return response.data
    } catch (error) {
      console.error('M-Pesa payment status check error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'Payment status check failed',
      }
    }
  },
}

/* -------------------------------------------------------------------------- */
/* 📩 SMS SERVICE                                                             */
/* -------------------------------------------------------------------------- */
export const smsService = {
  sendSMS: async (smsData) => {
    try {
      const response = await api.post('/sms/send', smsData)
      return response.data
    } catch (error) {
      console.error('SMS sending error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'SMS sending failed',
      }
    }
  },

  sendTicketSMS: async (data) => {
    try {
      const response = await api.post('/sms/send-ticket', data)
      return response.data
    } catch (error) {
      console.error('Ticket SMS sending error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'SMS sending failed but booking completed',
      }
    }
  },

  markSmsSent: async (ticketId) => {
    try {
      const response = await api.post('/sms/mark-sent', { ticketId })
      return response.data
    } catch (error) {
      console.error('Mark SMS sent error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'Failed to update SMS status',
      }
    }
  },
}

/* -------------------------------------------------------------------------- */
/* 🩺 HEALTH CHECK                                                            */
/* -------------------------------------------------------------------------- */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('Health check error:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      message: 'Health check failed',
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 🔐 AUTH UTILITIES                                                          */
/* -------------------------------------------------------------------------- */
export const isAuthenticated = () => {
  return !!localStorage.getItem('firebaseToken')
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem('firebaseToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default api