import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { actualizarPapelera } from "@/lib/driveWrite";
import { getOcultos } from "@/lib/papelera";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { folderId } = await req.json();
  if (!folderId) {
    return Response.json({ error: "Falta folderId" }, { status: 400 });
  }

  const actual = await getOcultos();
  const ocultos = Array.from(new Set([...(actual.ocultos || []), folderId]));
  const contador = (actual.contador || 0) + 1;

  await actualizarPapelera(
    process.env.ROOT_FOLDER_ID,
    { ocultos, contador },
    session.accessToken
  );

  return Response.json({ ok: true, contador, avisar: contador % 5 === 0 });
}