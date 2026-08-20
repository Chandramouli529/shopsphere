export interface VendorAccount {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  /** No longer stored client-side for accounts created via the real
   * Create Vendor flow — the backend generates and (eventually) emails
   * the password. Only present for any old locally-created records. */
  password?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  category: string;
  joinedAt: number;
  // Fields from the real Create Vendor form (admin/vendors.tsx). Kept
  // optional and alongside businessName/ownerName/category above rather
  // than replacing them, so nothing else in the app needed to change —
  // businessName is populated from shopName, ownerName from vendorName,
  // and category from businessType when a vendor is created through the
  // real flow.
  vendorName?: string;
  mobileNumber?: string;
  businessType?: string;
  shopName?: string;
}

/** Mock vendor accounts removed. Populate this from a real backend
 * (GET /admin/vendors) once one exists, or create vendors through the
 * real Admin > Vendor Management > Create Vendor form. */
export const VENDOR_ACCOUNTS: VendorAccount[] = [];