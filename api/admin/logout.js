import { clearSessionCookie } from "../../lib/auth.js";
import { json } from "../../lib/http.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405, {
      "Allow": "POST"
    });
  }

  return json(
    { ok: true },
    200,
    { "Set-Cookie": clearSessionCookie() }
  );
}
