import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for SMS
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('firebaseToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const mpesaService = {
  initiatePayment: async (paymentData) => {
    try {
      const response = await api.post('/mpesa/stk-push', paymentData);
      return response.data;
    } catch (error) {
      console.error('MPesa payment initiation error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'Payment initiation failed'
      };
    }
  },
  
  checkPaymentStatus: async (checkoutRequestId) => {
    try {
      const response = await api.get(`/mpesa/check-payment?checkoutRequestId=${checkoutRequestId}`);
      return response.data;
    } catch (error) {
      console.error('MPesa payment status check error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'Payment status check failed'
      };
    }
  }
};

export const smsService = {
  sendSMS: async (smsData) => {
    try {
      const response = await api.post('/sms/send', smsData);
      return response.data;
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'SMS sending failed'
      };
    }
  },

  sendTicketSMS: async (data) => {
    try {
      // ✅ No token required for this endpoint now - works for both authenticated and guest users
      const response = await api.post('/sms/send-ticket', data);
      return response.data;
    } catch (error) {
      console.error('Ticket SMS sending error:', error);
      // ✅ Return a success-like object even on error to not block the booking flow
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'SMS sending failed but booking completed'
      };
    }
  },

  markSmsSent: async (ticketId) => {
    try {
      const response = await api.post('/sms/mark-sent', { ticketId });
      return response.data;
    } catch (error) {
      console.error('Mark SMS sent error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: 'Failed to update SMS status'
      };
    }
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      message: 'Health check failed'
    };
  }
};

// ✅ New utility function to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('firebaseToken');
};

// ✅ New function to get auth headers conditionally
export const getAuthHeaders = () => {
  const token = localStorage.getItem('firebaseToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default api;