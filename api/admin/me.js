import { isAdmin } from "../../lib/auth.js";
import { json } from "../../lib/http.js";

export default async function handler(request) {
  if (request.method !== "GET") {
    return json({ error: "Método não permitido." }, 405, {
      "Allow": "GET"
    });
  }

  return json({
    authenticated: isAdmin(request)
  });
}
