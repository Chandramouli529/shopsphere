import axios from "axios";
import { secureStorage } from "@/services/secureStorage";

const API_BASE_URL =
  "https://shopsphere-ecommerce-82jz.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ======================================================
// ADD TOKEN TO REQUESTS
// ======================================================

api.interceptors.request.use(
  async (config) => {
    try {
      const token =
        await secureStorage.getToken();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    } catch (error) {
      console.error(
        "Error getting token:",
        error
      );

      // Do not block public requests such as
      // registration/login when SecureStore fails.
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// AUTH API
// ======================================================

export const authApi = {

  // ====================================================
  // REGISTER USER
  // ====================================================

  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
  }) => {

    const requestBody = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    console.log(
      "REGISTER REQUEST BODY:",
      {
        ...requestBody,

        // Don't print actual passwords
        password: "[HIDDEN]",
        confirmPassword: "[HIDDEN]",
      }
    );

    const response = await api.post(
      "/auth/register",
      requestBody
    );

    return response.data;
  },

  // ====================================================
  // VERIFY EMAIL OTP
  // ====================================================

  verifyEmail: async (
    email: string,
    otp: string
  ) => {
    const response = await api.post(
      "/auth/verify-email",
      {
        email,
        emailOtp: otp,
      }
    );

    return response.data;
  },

  // ====================================================
  // LOGIN
  // ====================================================

  login: async (data: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => {
  const response = await api.post("/auth/login", {
    email: data.email.trim(),
    password: data.password,
  });

  return response.data;
},

  // ====================================================
  // REQUEST OTP
  // ====================================================

  requestOtp: async (email: string) => {
    const response = await api.post(
      "/auth/verify-email",
      {
        email,
      }
    );

    return response.data;
  },

  // ====================================================
  // GET PROFILE
  // ====================================================

  getProfile: async () => {
    const response =
      await api.get("/auth/profile");

    return response.data;
  },

  // ====================================================
  // RESET PASSWORD
  // ====================================================

  resetPassword: async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    const response = await api.post(
      "/auth/reset-password",
      data
    );

    return response.data;
  },

  // ====================================================
  // CHANGE PASSWORD
  // ====================================================

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post(
      "/auth/change-password",
      data
    );

    return response.data;
  },
};

export default api;