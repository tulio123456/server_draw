import { del, list } from "@vercel/blob";
import { isAdmin } from "../../lib/auth.js";
import {
  json,
  safeCapturePath
} from "../../lib/http.js";

export default async function handler(request) {
  if (request.method !== "DELETE") {
    return json({ error: "Método não permitido." }, 405, {
      "Allow": "DELETE"
    });
  }

  if (!isAdmin(request)) {
    return json({ error: "Não autorizado." }, 401);
  }

  try {
    const body = await request.json();
    const pathname = body?.pathname;

    if (!safeCapturePath(pathname)) {
      return json({ error: "Caminho inválido." }, 400);
    }

    const found = await list({
      prefix: pathname,
      limit: 5
    });

    const exact = found.blobs.find(blob => blob.pathname === pathname);

    if (!exact) {
      return json({ error: "Captura não encontrada." }, 404);
    }

    await del(exact.url);

    return json({ ok: true });
  } catch (error) {
    console.error("Delete error:", error);
    return json({ error: "Falha ao excluir captura." }, 500);
  }
}
