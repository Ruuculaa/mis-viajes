import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { buscarOCrearCarpeta, subirArchivo } from "@/lib/driveWrite";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await req.formData();
  const nombreViaje = formData.get("nombreViaje");
  const archivos = formData.getAll("archivos");

  if (!nombreViaje || archivos.length === 0) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  const folderId = await buscarOCrearCarpeta(
    nombreViaje,
    process.env.ROOT_FOLDER_ID,
    session.accessToken
  );

  for (const archivo of archivos) {
    await subirArchivo(archivo, folderId, session.accessToken);
  }

  return Response.json({ ok: true });
}