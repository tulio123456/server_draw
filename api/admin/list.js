import { list } from "@vercel/blob";
import { isAdmin } from "../../lib/auth.js";
import { json } from "../../lib/http.js";

export default async function handler(request) {
  if (request.method !== "GET") {
    return json({ error: "Método não permitido." }, 405, {
      "Allow": "GET"
    });
  }

  if (!isAdmin(request)) {
    return json({ error: "Não autorizado." }, 401);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json({ error: "Vercel Blob não está conectado." }, 500);
  }

  try {
    const result = await list({
      prefix: "captures/",
      limit: 200
    });

    const items = result.blobs.map(blob => ({
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      contentType: blob.contentType || "image/jpeg"
    }));

    return json({
      items,
      hasMore: Boolean(result.hasMore),
      cursor: result.cursor || null
    });
  } catch (error) {
    console.error("List error:", error);
    return json({ error: "Falha ao listar capturas." }, 500);
  }
}
