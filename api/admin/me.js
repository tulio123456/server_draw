import { isAdmin } from "../../lib/auth.js";
import { json } from "../../lib/http.js";

export function GET(request) {
  return json({
    authenticated: isAdmin(request)
  });
}
