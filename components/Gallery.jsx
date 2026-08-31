"use client";
import { useState } from "react";
import Link from "next/link";

export default function Gallery({ titulo, fotos, folderId, puedeSubir }) {
  const [abierto, setAbierto] = useState(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100 px-4 py-12">
      <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
        <h1 className="text-4xl font-black text-center text-neutral-800 tracking-tight">
          {titulo}
        </h1>
        {puedeSubir && (
          <Link
            href={`/subir?carpeta=${folderId}&nombre=${encodeURIComponent(titulo)}`}
            className="text-sm bg-neutral-800 text-white px-4 py-2 rounded-full hover:bg-neutral-700 hover:scale-105 transition-all shadow-md"
          >
            + Añadir fotos
          </Link>
        )}
      </div>

      {(!fotos || fotos.length === 0) ? (
        <p className="text-center text-neutral-400">No hay fotos todavía.</p>
      ) : (
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
      )}

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