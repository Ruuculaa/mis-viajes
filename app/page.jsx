import Link from "next/link";
import { viajes } from "@/lib/viajes";
import { getFotos } from "@/lib/drive";

export default async function Home() {
  // Para cada viaje, pedimos sus fotos y usamos la primera como portada
  const viajesConPortada = await Promise.all(
    viajes.map(async (viaje) => {
      const folderId = process.env[viaje.folderIdEnv];
      const fotos = await getFotos(folderId);
      return { ...viaje, portada: fotos[0]?.thumb ?? null, total: fotos.length };
    })
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-12">
      <h1 className="text-4xl font-semibold text-center mb-10 tracking-tight">
        Nuestros viajes
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {viajesConPortada.map((viaje) => (
          <Link
            key={viaje.slug}
            href={`/${viaje.slug}`}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-900"
          >
            {viaje.portada ? (
              <img
                src={viaje.portada}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-600">
                Sin fotos aún
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-xl font-medium">{viaje.titulo}</h2>
              <p className="text-sm text-neutral-300">{viaje.total} fotos</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}