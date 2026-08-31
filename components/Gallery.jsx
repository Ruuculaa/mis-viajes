"use client";
import { useState } from "react";
import Link from "next/link";

export default function Gallery({ titulo, fotos: fotosIniciales, folderId, puedeSubir }) {
  const [abierto, setAbierto] = useState(null);
  const [fotos, setFotos] = useState(fotosIniciales);
  const [confirmando, setConfirmando] = useState(null); // id de la foto pendiente de confirmar
  const [ocultando, setOcultando] = useState(false);
  const [aviso, setAviso] = useState("");

  const pedirConfirmacion = (e, fotoId) => {
    e.stopPropagation();
    setConfirmando(fotoId);
  };

  const confirmarOcultar = async () => {
    const fotoId = confirmando;
    setOcultando(true);

    const res = await fetch("/api/eliminar-foto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId, fotoId }),
    });
    const data = await res.json();

    setOcultando(false);
    setConfirmando(null);

    if (data.ok) {
      setFotos((prev) => prev.filter((f) => f.id !== fotoId));
    } else {
      setAviso(data.error || "No se pudo mover la foto a la papelera.");
    }
  };

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
              {puedeSubir && (
                <button
                  onClick={(e) => pedirConfirmacion(e, item.id)}
                  title="Ocultar foto (no borra de Drive)"
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center text-neutral-500 hover:text-rose-500 hover:scale-110 transition-all z-10 text-xs"
                >
                  ✕
                </button>
              )}
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

      {/* Modal de confirmación para ocultar una foto */}
      {confirmando && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
          onClick={() => !ocultando && setConfirmando(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-3xl mb-3">🗑️</p>
            <p className="font-semibold text-neutral-800 mb-1">
              ¿Mover esta foto a la papelera?
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              Se moverá a una carpeta "Papelera" dentro de este mismo álbum en Drive. No se borra.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmando(null)}
                disabled={ocultando}
                className="flex-1 py-2.5 rounded-full border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarOcultar}
                disabled={ocultando}
                className="flex-1 py-2.5 rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {ocultando ? "Moviendo…" : "Mover"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de aviso, sustituye a alert() */}
      {aviso && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
          onClick={() => setAviso("")}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-3xl mb-3">⚠️</p>
            <p className="text-sm text-neutral-600 mb-6">{aviso}</p>
            <button
              onClick={() => setAviso("")}
              className="w-full py-2.5 rounded-full bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </main>
  );
}