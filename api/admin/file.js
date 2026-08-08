import { get } from "@vercel/blob";
import { isAdmin } from "../../lib/auth.js";
import { safeCapturePath } from "../../lib/http.js";

export default async function handler(request) {
  if (request.method !== "GET") {
    return new Response("Método não permitido.", {
      status: 405,
      headers: { "Allow": "GET" }
    });
  }

  if (!isAdmin(request)) {
    return new Response("Não autorizado.", { status: 401 });
  }

  const url = new URL(request.url);
  const pathname = url.searchParams.get("pathname");

  if (!safeCapturePath(pathname)) {
    return new Response("Caminho inválido.", { status: 400 });
  }

  try {
    const result = await get(pathname, {
      access: "private"
    });

    if (!result) {
      return new Response("Arquivo não encontrado.", { status: 404 });
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob?.contentType || "image/jpeg",
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("File error:", error);
    return new Response("Falha ao carregar imagem.", { status: 500 });
  }
}
