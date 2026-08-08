export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

export function getAllowedOrigins() {
  return String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(v => v.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function corsHeaders(request) {
  const origin = (request.headers.get("origin") || "").replace(/\/+$/, "");
  const allowed = getAllowedOrigins();

  if (!origin || !allowed.includes(origin)) {
    return null;
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

export function sanitizePart(value, fallback = "unknown") {
  const cleaned = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 80);

  return cleaned || fallback;
}

export function safeCapturePath(pathname) {
  return typeof pathname === "string" &&
    pathname.startsWith("captures/") &&
    !pathname.includes("..");
}
