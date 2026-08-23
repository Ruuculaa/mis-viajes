import Link from "next/link";
import { getViajes, getFotos } from "@/lib/drive";
import TarjetaViaje from "@/components/TarjetaViaje";

export default async function Home() {
  const viajes = await getViajes();

  const viajesConPortada = await Promise.all(
    viajes.map(async (viaje) => {
      const fotos = await getFotos(viaje.id);
      const portada = fotos.find((f) => f.starred) ?? fotos[0];
      return { ...viaje, portada: portada?.thumb ?? null, total: fotos.length };
    })
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100 px-4 py-14">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-center text-neutral-800 tracking-tight">
          Nuestros viajes
        </h1>
        <p className="text-center text-neutral-500 mt-2 mb-14">
          Cada recuerdo, guardado a salvo 🧡
        </p>

        {viajesConPortada.length === 0 ? (
          <p className="text-center text-neutral-400">
            Aún no hay viajes por aquí. ¡Sube el primero!
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-14">
            {viajesConPortada.map((viaje, i) => (
              <TarjetaViaje key={viaje.id} viaje={viaje} index={i} />
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <Link
            href="/subir"
            className="inline-block bg-neutral-800 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-neutral-700 hover:scale-105 transition-all shadow-lg"
          >
            + Subir fotos nuevas
          </Link>
        </div>
      </div>
    </main>
  );
}