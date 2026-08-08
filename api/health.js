import { json } from "../lib/http.js";

export function GET() {
  return json({
    ok: true,
    service: "AirDraw Photo Server Vercel",
    storage: "Vercel Blob",
    time: new Date().toISOString()
  });
}
