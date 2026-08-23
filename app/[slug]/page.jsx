import Gallery from "@/components/Gallery";
import { getViajes, getFotos } from "@/lib/drive";

export default async function ViajePage({ params }) {
  const { slug } = params;
  const viajes = await getViajes();
  const viaje = viajes.find((v) => v.slug === slug);

  if (!viaje) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">Viaje no encontrado.</p>
      </main>
    );
  }

  const fotos = await getFotos(viaje.id);
  return <Gallery titulo={viaje.nombre} fotos={fotos} />;
}