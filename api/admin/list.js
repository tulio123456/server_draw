import { list } from "@vercel/blob";
import { isAdmin } from "../../lib/auth.js";
import { json } from "../../lib/http.js";

export async function GET(request) {
  if (!isAdmin(request)) {
    return json({ error: "Não autorizado." }, 401);
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
    console.error(error);
    return json({ error: "Falha ao listar capturas." }, 500);
  }
}
