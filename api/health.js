import { json } from "../lib/http.js";

export default async function handler(request) {
  if (request.method !== "GET") {
    return json({ error: "Método não permitido." }, 405, {
      "Allow": "GET"
    });
  }

  return json({
    ok: true,
    service: "AirDraw Photo Server Vercel",
    storage: "Vercel Blob",
    time: new Date().toISOString()
  });
}
