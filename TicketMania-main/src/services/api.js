import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('firebaseToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const mpesaService = {
  initiatePayment: async (paymentData) => {
    const response = await api.post('/mpesa/stk-push', paymentData);
    return response.data;
  },
  
  checkPaymentStatus: async (checkoutRequestId) => {
    const response = await api.get(`/mpesa/check-payment?checkoutRequestId=${checkoutRequestId}`);
    return response.data;
  }
};

export const smsService = {
  sendSMS: async (smsData) => {
    const response = await api.post('/sms/send', smsData);
    return response.data;
  },
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;