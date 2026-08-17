import axios from "axios";
import { secureStorage } from "@/services/secureStorage";

const API_BASE_URL = "https://shopsphere-ecommerce-82jz.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  // Register User
  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      mobileNumber: data.mobileNumber,
      // Every account created through the customer app's Register screen is
      // a customer — this isn't user-selectable, so it's set automatically
      // here rather than exposed as a form field.
      role: "customer",
    });
    return response.data;
  },

  // Verify Email OTP
  verifyEmail: async (email: string, otp: string) => {
    const response = await api.post("/auth/verify-email", {
      email,
      emailOtp: otp,
    });
    return response.data;
  },

  // Login User
  login: async (data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    const response = await api.post("/auth/login", {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  // Request OTP (for resend)
  requestOtp: async (email: string) => {
    const response = await api.post("/auth/verify-email", { email });
    // or if you have a dedicated endpoint like /auth/request-otp, use that:
    // const response = await api.post('/auth/request-otp', { email });
    return response.data;
  },

  // Get Profile
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Reset password after forgot-password OTP verification.
  // NOTE: endpoint path/shape is a guess following the same /auth/* pattern
  // as the rest of this file — confirm against your actual backend route
  // and adjust if it differs (e.g. field names, or a separate verify step).
  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  // Change password for an already-logged-in user.
  // NOTE: same caveat as resetPassword — confirm this matches your backend.
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },
};

export default api;