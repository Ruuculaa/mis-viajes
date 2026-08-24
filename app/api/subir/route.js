import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUsuarios } from "@/lib/usuarios";
import {
  buscarOCrearCarpeta,
  subirArchivo,
  marcarComoPortada,
} from "@/lib/driveWrite";

export const maxDuration = 60; // segundos - máximo permitido en el plan gratuito de Vercel

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || !session?.user?.email) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const usuarios = getUsuarios();
  const rootDestino = usuarios[session.user.email.toLowerCase()];

  if (!rootDestino) {
    return Response.json(
      { error: `Tu email (${session.user.email}) no está en la variable USUARIOS` },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const nombreViaje = formData.get("nombreViaje");
  const archivos = formData.getAll("archivos");
  const portadaNombre = formData.get("portadaNombre");

  if (!nombreViaje || archivos.length === 0) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  const folderId = await buscarOCrearCarpeta(
    nombreViaje,
    rootDestino,
    session.accessToken
  );

  if (!folderId) {
    return Response.json(
      { error: `No se pudo crear/encontrar la carpeta en ${rootDestino}. Revisa que ese ID de carpeta exista y sea tuyo.` },
      { status: 500 }
    );
  }

  let portadaId = null;
  const errores = [];

  for (const archivo of archivos) {
    const subido = await subirArchivo(archivo, folderId, session.accessToken);
    if (!subido?.id) {
      errores.push({ archivo: archivo.name, detalle: subido?.error?.message || "fallo desconocido" });
      continue;
    }
    if (portadaNombre && archivo.name === portadaNombre) {
      portadaId = subido.id;
    }
  }

  if (portadaId) {
    await marcarComoPortada(folderId, portadaId, session.accessToken);
  }

  if (errores.length > 0) {
    return Response.json(
      { ok: errores.length < archivos.length, errores, folderId },
      { status: errores.length === archivos.length ? 500 : 207 }
    );
  }

  return Response.json({ ok: true, folderId });
}