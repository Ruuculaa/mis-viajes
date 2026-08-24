import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { marcarComoPortada } from "@/lib/driveWrite";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { folderId, fileId } = await req.json();
  if (!folderId || !fileId) {
    return Response.json({ error: "Faltan datos" }, { status: 400 });
  }

  await marcarComoPortada(folderId, fileId, session.accessToken);
  return Response.json({ ok: true });
}