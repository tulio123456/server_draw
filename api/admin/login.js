import {
  createSessionCookie,
  verifyPassword
} from "../../lib/auth.js";
import { json } from "../../lib/http.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405, {
      "Allow": "POST"
    });
  }

  try {
    const body = await request.json();
    const password = String(body?.password || "");

    if (!verifyPassword(password)) {
      return json({ error: "Senha incorreta." }, 401);
    }

    return json(
      { ok: true },
      200,
      { "Set-Cookie": createSessionCookie() }
    );
  } catch (error) {
    console.error("Login error:", error);

    return json({
      error: "Não foi possível fazer login.",
      detail: process.env.NODE_ENV === "development"
        ? String(error?.message || error)
        : undefined
    }, 500);
  }
}
