import {
  createSessionCookie,
  verifyPassword
} from "../../lib/auth.js";
import { json } from "../../lib/http.js";

export async function POST(request) {
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
    console.error(error);
    return json({ error: "Não foi possível fazer login." }, 400);
  }
}
