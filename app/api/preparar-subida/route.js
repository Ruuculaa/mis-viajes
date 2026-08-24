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

  try {
    const folderId = await buscarOCrearCarpeta(nombreViaje, rootDestino, session.accessToken);
    return Response.json({ folderId });
  } catch (err) {
    console.error("Error en preparar-subida:", err);
    return Response.json({ error: `Google Drive: ${err.message}` }, { status: 500 });
  }
}