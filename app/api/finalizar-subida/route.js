import { revalidatePath } from "next/cache";

// Le dice a Next.js "olvida la caché de estas páginas", para que las fotos
// recién subidas aparezcan al instante en vez de esperar a que expire la caché.
export async function POST(req) {
  const { slug } = await req.json();

  revalidatePath("/");
  if (slug) revalidatePath(`/${slug}`);

  return Response.json({ ok: true });
}