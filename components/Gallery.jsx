"use client";
import { useState } from "react";

export default function Gallery({ titulo, fotos }) {
  const [fotoAbierta, setFotoAbierta] = useState(null);

  if (!fotos || fotos.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">No se encontraron fotos todavía.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-10">
      <h1 className="text-3xl font-semibold text-center mb-8 tracking-tight">
        {titulo}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-5xl mx-auto">
        {fotos.map((foto) => (
          <button
            key={foto.id}
            onClick={() => setFotoAbierta(foto.full)}
            className="relative aspect-square overflow-hidden rounded-lg group"
          >
            <img
              src={foto.thumb}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {fotoAbierta && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setFotoAbierta(null)}
        >
          <img
            src={fotoAbierta}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </main>
  );
}