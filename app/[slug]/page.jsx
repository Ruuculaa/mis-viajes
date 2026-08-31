import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUsuarios } from "@/lib/usuarios";
import Gallery from "@/components/Gallery";
import { getViajes, getFotos } from "@/lib/drive";

export default async function ViajePage({ params }) {
  const { slug } = await params;
  const [viajes, session] = await Promise.all([
    getViajes(),
    getServerSession(authOptions),
  ]);
  const viaje = viajes.find((v) => v.slug === slug);

  if (!viaje) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100 flex items-center justify-center">
        <p className="text-neutral-400">Viaje no encontrado.</p>
      </main>
    );
  }

  const fotos = await getFotos(viaje.id);

  // ¿La persona con sesión iniciada es dueña de la carpeta raíz de ESTE viaje en concreto?
  const usuarios = getUsuarios();
  const raizPropia = session?.user?.email ? usuarios[session.user.email.toLowerCase()] : null;
  const puedeSubir = raizPropia === viaje.raiz;

  return (
    <Gallery
      titulo={viaje.nombre}
      fotos={fotos}
      folderId={viaje.id}
      puedeSubir={puedeSubir}
    />
  );
}