import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { actualizarPapelera } from "@/lib/driveWrite";
import { leerPapelera } from "@/lib/papelera";

// Oculta UNA foto dentro de su propia carpeta de viaje. No borra nada de Drive.
// Google Drive ya se encarga de rechazar esto si la persona no tiene permiso
// real de escritura en esa carpeta (no hace falta comprobarlo nosotros).
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { folderId, fotoId } = await req.json();
  if (!folderId || !fotoId) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  try {
    const actual = await leerPapelera(folderId);
    const ocultos = Array.from(new Set([...(actual.ocultos || []), fotoId]));
    const contador = (actual.contador || 0) + 1;

    await actualizarPapelera(folderId, { ocultos, contador }, session.accessToken);

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Error ocultando foto:", err);
    return Response.json({ error: err.message || "No se pudo ocultar la foto" }, { status: 500 });
  }
}