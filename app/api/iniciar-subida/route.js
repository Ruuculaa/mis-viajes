import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { iniciarSubidaResumable } from "@/lib/driveWrite";

// Pide a Google el permiso/URL de subida para UN archivo. Payload pequeño (solo el nombre).
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { nombreArchivo, mimeType, folderId } = await req.json();
  if (!nombreArchivo || !folderId) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Le decimos a Google desde qué web se va a subir el archivo después,
  // para que permita la conexión directa navegador -> Google (CORS).
  const origen = req.headers.get("origin") || new URL(req.url).origin;

  const uploadUrl = await iniciarSubidaResumable(
    nombreArchivo,
    mimeType,
    folderId,
    session.accessToken,
    origen
  );

  if (!uploadUrl) {
    return Response.json({ error: "Google no dio permiso de subida" }, { status: 500 });
  }

  return Response.json({ uploadUrl });
}