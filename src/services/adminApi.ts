import * as SecureStore from "expo-secure-store";
import axios from "axios";

const API_BASE_URL = "https://shopsphere-ecommerce-82jz.onrender.com/api";

// Separate from customer authApi.ts's axios instance — admin requests
// carry the admin's own token, not the customer session token, since
// they're two independent logins.
const ADMIN_TOKEN_KEY = "shopsphere_admin_access_token";

const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

adminApiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ADMIN_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface CreateVendorInput {
  firstName: string;
  lastName: string;
  vendorName: string;
  email: string;
  mobileNumber: string;
  businessType: string;
  shopName: string;
}

export const adminApi = {
  // Admin Login
  login: async (data: { email: string; password: string }) => {
    const response = await adminApiClient.post("/auth/admin/login", {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  // Create Vendor
  // Sent with the admin's Authorization header attached automatically by
  // the interceptor above (that's the "token used to create a vendor"
  // part) — no password field is sent from the client; the backend is
  // expected to generate one and (eventually) email it to the vendor.
  createVendor: async (data: CreateVendorInput) => {
    const response = await adminApiClient.post("/vendor/create", data);
    return response.data;
  },

  // List all vendors
  getVendors: async () => {
    const response = await adminApiClient.get("/vendor");
    return response.data;
  },

  // Update a vendor — used for approve/reject/suspend/reactivate (status
  // change) as well as any other field edit.
  updateVendor: async (id: string, data: Record<string, unknown>) => {
    const response = await adminApiClient.patch(`/vendor/${id}`, data);
    return response.data;
  },

  // Delete a vendor
  deleteVendor: async (id: string) => {
    const response = await adminApiClient.delete(`/vendor/${id}`);
    return response.data;
  },

  // Get Admin Profile (for session restore)
  // GUESSED endpoint — confirm against the real backend route.
  getProfile: async () => {
    const response = await adminApiClient.get("/admin/profile");
    return response.data;
  },
};

export default adminApiClient;