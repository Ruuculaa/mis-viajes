import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  buscarOCrearCarpeta,
  subirArchivo,
  marcarComoPortada,
} from "@/lib/driveWrite";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await req.formData();
  const nombreViaje = formData.get("nombreViaje");
  const archivos = formData.getAll("archivos");
  const portadaNombre = formData.get("portadaNombre"); // puede venir vacío

  if (!nombreViaje || archivos.length === 0) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  const folderId = await buscarOCrearCarpeta(
    nombreViaje,
    process.env.ROOT_FOLDER_ID,
    session.accessToken
  );

  let portadaId = null;

  for (const archivo of archivos) {
    const subido = await subirArchivo(archivo, folderId, session.accessToken);
    if (portadaNombre && archivo.name === portadaNombre) {
      portadaId = subido.id;
    }
  }

  if (portadaId) {
    await marcarComoPortada(folderId, portadaId, session.accessToken);
  }

  return Response.json({ ok: true });
}