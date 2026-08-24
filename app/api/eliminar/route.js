import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUsuarios } from "@/lib/usuarios";
import { actualizarPapelera } from "@/lib/driveWrite";
import { getOcultos } from "@/lib/papelera";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || !session?.user?.email) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  // Solo el propietario puede ocultar viajes
  if (session.user.email.toLowerCase() !== process.env.OWNER_EMAIL?.toLowerCase()) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const { folderId } = await req.json();
  if (!folderId) {
    return Response.json({ error: "Falta folderId" }, { status: 400 });
  }

  const usuarios = getUsuarios();
  const rootPropio = usuarios[process.env.OWNER_EMAIL.toLowerCase()];

  const actual = await getOcultos();
  const ocultos = Array.from(new Set([...(actual.ocultos || []), folderId]));
  const contador = (actual.contador || 0) + 1;

  await actualizarPapelera(rootPropio, { ocultos, contador }, session.accessToken);

  return Response.json({ ok: true, contador, avisar: contador % 5 === 0 });
}