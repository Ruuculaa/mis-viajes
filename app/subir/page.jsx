"use client";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Subir() {
  const { data: session, status } = useSession();
  const [nombreViaje, setNombreViaje] = useState("");
  const [archivos, setArchivos] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");

  if (status === "loading") return null;

  if (!session) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4">
        <p>Inicia sesión con Google para subir fotos</p>
        <button
          onClick={() => signIn("google")}
          className="bg-white text-black px-5 py-3 rounded-lg font-medium"
        >
          Iniciar sesión con Google
        </button>
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombreViaje || !archivos || archivos.length === 0) return;

    setSubiendo(true);
    setMensaje("");

    const formData = new FormData();
    formData.append("nombreViaje", nombreViaje);
    Array.from(archivos).forEach((a) => formData.append("archivos", a));

    try {
      const res = await fetch("/api/subir", { method: "POST", body: formData });
      const data = await res.json();

      if (data.ok) {
        setMensaje(`Subido${archivos.length > 1 ? "s" : ""}: ${archivos.length} archivo(s) a "${nombreViaje}".`);
        setNombreViaje("");
        setArchivos(null);
        e.target.reset();
      } else {
        setMensaje("Error al subir. Inténtalo de nuevo.");
      }
    } catch {
      setMensaje("Error de conexión. Inténtalo de nuevo.");
    }

    setSubiendo(false);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-neutral-400">Hola, {session.user?.name}</p>
          <button onClick={() => signOut()} className="text-sm text-neutral-400 underline">
            Cerrar sesión
          </button>
        </div>

        <h1 className="text-2xl font-semibold mb-6">Subir fotos / vídeos</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre del viaje (ej: Nantes 2026)"
            value={nombreViaje}
            onChange={(e) => setNombreViaje(e.target.value)}
            className="bg-neutral-900 rounded-lg px-4 py-3 outline-none"
          />
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setArchivos(e.target.files)}
            className="bg-neutral-900 rounded-lg px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={subiendo}
            className="bg-white text-black rounded-lg px-4 py-3 font-medium disabled:opacity-50"
          >
            {subiendo ? "Subiendo..." : "Subir"}
          </button>
        </form>

        {mensaje && <p className="mt-4 text-sm text-neutral-300">{mensaje}</p>}
      </div>
    </main>
  );
}