"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function TarjetaViaje({ viaje, index }) {
  const { data: session } = useSession();
  const [eliminando, setEliminando] = useState(false);
  const [oculta, setOculta] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [aviso, setAviso] = useState("");

  if (oculta) return null;

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      const res = await fetch("/api/eliminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: viaje.id }),
      });
      const data = await res.json();

      setConfirmando(false);

      if (data.ok) {
        setOculta(true);
        if (data.avisar) {
          setTimeout(() => {
            setAviso(
              `Llevas ${data.contador} viajes ocultados 🗑️ Recuerda que las fotos siguen ocupando espacio en tu Google Drive. Cuando puedas, entra en Drive y limpia manualmente las carpetas que ya no quieras conservar.`
            );
          }, 300);
        }
      }
    } finally {
      setEliminando(false);
    }
  };

  const rotacion = index % 3 === 0 ? "-rotate-3" : index % 3 === 1 ? "rotate-2" : "-rotate-1";

  return (
    <div
      className={`relative bg-white p-3 pb-7 rounded-lg shadow-[0_8px_20px_-6px_rgba(0,0,0,0.25)] ${rotacion} hover:rotate-0 hover:scale-[1.04] hover:shadow-[0_14px_28px_-8px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out`}
    >
      {session && (
        <button
          onClick={() => setConfirmando(true)}
          disabled={eliminando}
          title="Ocultar viaje (no borra de Drive)"
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:scale-110 transition-all z-10 text-sm"
        >
          {eliminando ? "…" : "✕"}
        </button>
      )}

      <div className="aspect-square overflow-hidden rounded bg-gradient-to-br from-amber-100 to-rose-100">
        {viaje.portada ? (
          <img src={viaje.portada} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">
            📷
          </div>
        )}
      </div>

      <p className="mt-3 text-center font-semibold text-neutral-800 leading-snug">
        {viaje.nombre}
      </p>
      <p className="text-center text-xs text-neutral-400 mt-0.5">
        {viaje.total} {viaje.total === 1 ? "foto" : "fotos"}
      </p>
      {session && (
        <p className="text-center text-[11px] text-sky-500 mt-1 font-mono">
          /{viaje.slug}
        </p>
      )}

      {/* Modal de confirmación propio, sustituye a confirm() */}
      {confirmando && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
          onClick={() => !eliminando && setConfirmando(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-3xl mb-3">🗑️</p>
            <p className="font-semibold text-neutral-800 mb-1">
              ¿Ocultar "{viaje.nombre}"?
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              No se borra nada de Google Drive, solo desaparece de esta lista.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmando(false)}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-full border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="flex-1 py-2.5 rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {eliminando ? "Ocultando…" : "Ocultar"}
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
            <p className="text-3xl mb-3">📦</p>
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
    </div>
  );
}