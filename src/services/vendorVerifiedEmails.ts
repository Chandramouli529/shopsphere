import AsyncStorage from "@react-native-async-storage/async-storage";

/** Tracks which vendor emails have already completed OTP verification at
 * least once, so returning logins with the same email can skip straight
 * to the password step instead of asking for the OTP again every time —
 * OTP is a one-time "prove you own this email" check, not a per-login
 * requirement. */
const VERIFIED_EMAILS_KEY = "shopsphere_vendor_verified_emails";

async function getVerifiedEmails(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(VERIFIED_EMAILS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function isEmailVerified(email: string): Promise<boolean> {
  const list = await getVerifiedEmails();
  return list.includes(email.trim().toLowerCase());
}

export async function markEmailVerified(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const list = await getVerifiedEmails();
  if (!list.includes(normalized)) {
    await AsyncStorage.setItem(VERIFIED_EMAILS_KEY, JSON.stringify([...list, normalized]));
  }
}

/** Clears the "already verified" flag for one email — mainly useful while
 * testing, so the same test account can be run through the first-time OTP
 * flow again without needing to clear all app storage or reinstall. */
export async function resetEmailVerification(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const list = await getVerifiedEmails();
  await AsyncStorage.setItem(VERIFIED_EMAILS_KEY, JSON.stringify(list.filter((e) => e !== normalized)));
}