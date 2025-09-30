import axios from "axios";

// Get API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL, // e.g. https://ticket-backend-vnng.onrender.com/api
  timeout: 15000, // Increased timeout for SMS
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("firebaseToken");
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
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const mpesaService = {
  initiatePayment: async (paymentData) => {
    const response = await api.post("/mpesa/stk-push", paymentData);
    return response.data;
  },

  checkPaymentStatus: async (checkoutRequestId) => {
    const response = await api.get(
      `/mpesa/check-payment?checkoutRequestId=${checkoutRequestId}`
    );
    return response.data;
  },
};

export const smsService = {
  sendSMS: async (smsData) => {
    const response = await api.post("/sms/send", smsData);
    return response.data;
  },

  sendTicketSMS: async (ticketData, userData) => {
    const response = await api.post("/sms/send-ticket", {
      ticket: ticketData,
      user: userData,
    });
    return response.data;
  },

  markSmsSent: async (ticketId) => {
    const response = await api.post("/sms/mark-sent", { ticketId });
    return response.data;
  },
};

export const healthCheck = async () => {
  const response = await api.get("/health");
  return response.data;
};

export default api;
