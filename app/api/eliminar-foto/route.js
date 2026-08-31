import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { moverAPapelera } from "@/lib/driveWrite";

// Mueve UNA foto a la subcarpeta "Papelera" dentro de su propio álbum.
// Es un movimiento real en Drive: sigue existiendo, solo cambia de carpeta.
// Google rechaza esto solo si la persona no tiene permiso real de escritura ahí.
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
    await moverAPapelera(fotoId, folderId, session.accessToken);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Error moviendo foto a papelera:", err);
    return Response.json({ error: err.message || "No se pudo mover la foto" }, { status: 500 });
  }
}