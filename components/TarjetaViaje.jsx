"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function TarjetaViaje({ viaje, index }) {
  const { data: session } = useSession();
  const [eliminando, setEliminando] = useState(false);
  const [oculta, setOculta] = useState(false);

  if (oculta) return null;

  const handleEliminar = async () => {
    const confirmado = confirm(
      `¿Ocultar "${viaje.nombre}" de esta lista?\n\nNo se borra nada de Google Drive, solo desaparece de aquí. Podrás recuperarlo manualmente si hace falta.`
    );
    if (!confirmado) return;

    setEliminando(true);
    try {
      const res = await fetch("/api/eliminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: viaje.id }),
      });
      const data = await res.json();

      if (data.ok) {
        setOculta(true);
        if (data.avisar) {
          setTimeout(() => {
            alert(
              `Llevas ${data.contador} viajes ocultados 🗑️\n\nRecuerda que las fotos siguen ocupando espacio en tu Google Drive. Cuando puedas, entra en Drive y limpia manualmente las carpetas que ya no quieras conservar.`
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
          onClick={handleEliminar}
          disabled={eliminando}
          title="Ocultar viaje (no borra de Drive)"
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:scale-110 transition-all z-10 text-sm"
        >
          {eliminando ? "…" : "✕"}
        </button>
      )}

      <div className="aspect-square overflow-hidden rounded bg-gradient-to-br from-amber-100 to-rose-100">
        {viaje.portada ? (
          <img
            src={viaje.portada}
            alt=""
            className="w-full h-full object-cover"
          />
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
    </div>
  );
}