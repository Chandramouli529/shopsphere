/** Base64url-encodes a JS object the way a real JWT would, so the resulting
 * token structurally looks like a real one (three dot-separated segments)
 * for demo purposes. The "signature" segment is NOT cryptographically
 * valid — there's no backend here to hold a signing secret. A real
 * implementation issues this token server-side after verifying credentials
 * against a real database; this only exists so the app has something
 * JWT-shaped to store in SecureStore and inspect. */
function base64url(obj: object): string {
  const json = JSON.stringify(obj);
  // atob/btoa aren't guaranteed in the RN runtime; do it manually.
  const bytes = Array.from(json).map((c) => c.charCodeAt(0));
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export interface MockJwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function createMockAccessToken(userId: string, email: string, role: string = "customer"): string {
  const header = { alg: "none", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: MockJwtPayload = {
    sub: userId,
    email,
    role,
    iat: now,
    exp: now + 60 * 60, // 1 hour
  };
  return `${base64url(header)}.${base64url(payload)}.mocksignature`;
}

export function createMockRefreshToken(userId: string): string {
  const header = { alg: "none", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: userId, iat: now, exp: now + 60 * 60 * 24 * 30 };
  return `${base64url(header)}.${base64url(payload)}.mocksignature`;
}
