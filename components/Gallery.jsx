"use client";
import { useState } from "react";

export default function Gallery({ titulo, fotos }) {
  const [abierto, setAbierto] = useState(null);

  if (!fotos || fotos.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100 flex items-center justify-center">
        <p className="text-neutral-400">No se encontraron fotos todavía.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100 px-4 py-12">
      <h1 className="text-4xl font-black text-center mb-10 text-neutral-800 tracking-tight">
        {titulo}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
        {fotos.map((item) => (
          <button
            key={item.id}
            onClick={() => setAbierto(item)}
            className="relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white p-1"
          >
            <div className="relative w-full h-full overflow-hidden rounded-lg">
              <img
                src={item.thumb}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                loading="lazy"
              />
              {item.tipo === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                    <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[14px] border-l-neutral-800 ml-1" />
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {abierto && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setAbierto(null)}
        >
          {abierto.tipo === "video" ? (
            <iframe
              src={`https://drive.google.com/file/d/${abierto.id}/preview`}
              className="w-full max-w-3xl aspect-video rounded-lg"
              allow="autoplay"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={abierto.full}
              alt=""
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          )}
        </div>
      )}
    </main>
  );
}