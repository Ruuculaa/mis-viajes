import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUsuarios } from "@/lib/usuarios";
import { buscarOCrearCarpeta } from "@/lib/driveWrite";

// Crea/encuentra la carpeta del viaje. Payload pequeño, sin archivos.
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

  const { nombreViaje } = await req.json();
  if (!nombreViaje) {
    return Response.json({ error: "Falta el nombre del viaje" }, { status: 400 });
  }

  const folderId = await buscarOCrearCarpeta(nombreViaje, rootDestino, session.accessToken);

  if (!folderId) {
    return Response.json({ error: "No se pudo crear/encontrar la carpeta" }, { status: 500 });
  }

  return Response.json({ folderId });
}