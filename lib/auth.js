import {
  createHmac,
  timingSafeEqual
} from "node:crypto";

const COOKIE_NAME = "airdraw_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET não configurado.");
  }
  return value;
}

function sign(value) {
  return createHmac("sha256", secret())
    .update(value)
    .digest("base64url");
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));

  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

function parseCookies(request) {
  const raw = request.headers.get("cookie") || "";
  const result = {};

  for (const item of raw.split(";")) {
    const idx = item.indexOf("=");
    if (idx < 0) continue;

    const key = item.slice(0, idx).trim();
    const val = item.slice(idx + 1).trim();
    result[key] = decodeURIComponent(val);
  }

  return result;
}

export function verifyPassword(input) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) {
    throw new Error("ADMIN_PASSWORD não configurado.");
  }
  return safeEqual(input, expected);
}

export function createSessionCookie() {
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = String(expiresAt);
  const token = `${payload}.${sign(payload)}`;

  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${MAX_AGE_SECONDS}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");
}

export function clearSessionCookie() {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");
}

export function isAdmin(request) {
  try {
    const token = parseCookies(request)[COOKIE_NAME];
    if (!token) return false;

    const [payload, signature] = token.split(".");
    if (!payload || !signature) return false;

    const expiresAt = Number(payload);
    if (!Number.isFinite(expiresAt)) return false;
    if (expiresAt < Math.floor(Date.now() / 1000)) return false;

    return safeEqual(signature, sign(payload));
  } catch {
    return false;
  }
}
