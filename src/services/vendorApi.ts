import { safeGetItem } from "@/services/secureStorage";
import axios from "axios";

const API_BASE_URL = "https://shopsphere-ecommerce-82jz.onrender.com/api";

// Separate from customer authApi.ts and admin adminApi.ts — vendor
// requests carry the vendor's own token, since all three are
// independent sessions that don't share storage.
const VENDOR_TOKEN_KEY = "shopsphere_vendor_access_token";

const vendorApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

vendorApiClient.interceptors.request.use(async (config) => {
  const token = await safeGetItem(VENDOR_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface VendorData {
  /** Confirmed real field name from an actual /vendor/login response
   * dump — the vendor's own id comes back as `vendorId`, not `_id`.
   * `_id`/`id` are kept as fallbacks in case the shape ever varies by
   * endpoint (e.g. a future /vendor/profile). */
  vendorId?: string;
  _id?: string;
  id?: string;
  businessName?: string;
  shopName?: string;
  ownerName?: string;
  vendorName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  category?: string;
  businessType?: string;
  status?: string;
  role: string;
}

export const vendorApi = {
  // Verify the email OTP admin sent when the vendor account was created.
  verify: async (data: { email: string; otp: string }) => {
    const response = await vendorApiClient.post("/vendor/verify", {
      email: data.email,
      emailOtp: data.otp,
    });
    return response.data;
  },

  // Vendor Login (email + password) — password was also emailed by admin.
  login: async (data: { email: string; password: string }) => {
    const response = await vendorApiClient.post("/vendor/login", {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },
};

export { VENDOR_TOKEN_KEY };
export default vendorApiClient;