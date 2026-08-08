import { put } from "@vercel/blob";
import {
  corsHeaders,
  json,
  sanitizePart
} from "../lib/http.js";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export function OPTIONS(request) {
  const cors = corsHeaders(request);

  if (!cors) {
    return json(
      { error: "Origem não autorizada." },
      403
    );
  }

  return new Response(null, {
    status: 204,
    headers: cors
  });
}

export async function POST(request) {
  const cors = corsHeaders(request);

  if (!cors) {
    return json(
      { error: "Origem não autorizada. Verifique ALLOWED_ORIGINS." },
      403
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json(
      { error: "Vercel Blob ainda não está conectado ao projeto." },
      500,
      cors
    );
  }

  try {
    const form = await request.formData();
    const photo = form.get("photo");

    if (!photo || typeof photo.arrayBuffer !== "function") {
      return json({ error: "Campo 'photo' não recebido." }, 400, cors);
    }

    if (!String(photo.type || "").startsWith("image/")) {
      return json({ error: "O arquivo enviado não é uma imagem." }, 415, cors);
    }

    if (photo.size > MAX_UPLOAD_BYTES) {
      return json({ error: "Imagem maior que 4 MB." }, 413, cors);
    }

    const sessionId = sanitizePart(form.get("sessionId"), "sem_sessao");
    const now = Date.now();

    // Inverter o timestamp faz a listagem lexicográfica começar pelos arquivos mais novos.
    const inverseTime = String(9_999_999_999_999 - now).padStart(13, "0");

    const extension =
      photo.type === "image/png" ? "png" :
      photo.type === "image/webp" ? "webp" :
      "jpg";

    const pathname =
      `captures/${inverseTime}-${now}-${sessionId}.${extension}`;

    const blob = await put(pathname, photo, {
      access: "private",
      addRandomSuffix: true
    });

    return json({
      ok: true,
      pathname: blob.pathname,
      uploadedAt: blob.uploadedAt || new Date().toISOString()
    }, 201, cors);
  } catch (error) {
    console.error("Upload error:", error);

    return json({
      error: "Falha ao armazenar a captura.",
      detail: process.env.NODE_ENV === "development" ? String(error?.message || error) : undefined
    }, 500, cors);
  }
}
