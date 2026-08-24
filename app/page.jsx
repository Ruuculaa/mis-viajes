"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Subir() {
  const { data: session, status } = useSession();
  const [nombreViaje, setNombreViaje] = useState("");
  const [archivos, setArchivos] = useState(null);
  const [portada, setPortada] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState("");
  const [mensaje, setMensaje] = useState("");

  if (status === "loading") return null;

  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100 flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-4xl">📸</p>
        <p className="text-neutral-600 text-center">
          Inicia sesión con Google para subir fotos
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-neutral-800 text-white px-6 py-3 rounded-full font-medium hover:bg-neutral-700 hover:scale-105 transition-all shadow-lg"
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
    setProgreso("Preparando carpeta…");

    try {
      // 1. Crear/encontrar la carpeta del viaje (payload pequeño)
      const prepRes = await fetch("/api/preparar-subida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreViaje }),
      });
      const prepData = await prepRes.json();

      if (!prepData.folderId) {
        setMensaje(`⚠️ ${prepData.error || "No se pudo preparar la subida."}`);
        setSubiendo(false);
        setProgreso("");
        return;
      }

      const folderId = prepData.folderId;
      const listaArchivos = Array.from(archivos);
      let portadaId = null;
      let subidos = 0;

      for (let i = 0; i < listaArchivos.length; i++) {
        const archivo = listaArchivos[i];
        setProgreso(`Subiendo ${i + 1} de ${listaArchivos.length}…`);

        // 2. Pedir a Google la URL de subida para ESTE archivo
        const initRes = await fetch("/api/iniciar-subida", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombreArchivo: archivo.name,
            mimeType: archivo.type,
            folderId,
          }),
        });
        const initData = await initRes.json();
        if (!initData.uploadUrl) continue;

        // 3. Subir el archivo DIRECTAMENTE a Google, sin pasar por nuestro servidor
        const subidaRes = await fetch(initData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": archivo.type || "application/octet-stream" },
          body: archivo,
        });
        const subidaData = await subidaRes.json();

        if (subidaData.id) {
          subidos++;
          if (portada === archivo.name) portadaId = subidaData.id;
        }
      }

      // 4. Marcar portada si se eligió
      if (portadaId) {
        await fetch("/api/marcar-portada", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId, fileId: portadaId }),
        });
      }

      if (subidos > 0) {
        setMensaje(`✅ Subido${subidos > 1 ? "s" : ""}: ${subidos} archivo(s) a "${nombreViaje}".`);
        setNombreViaje("");
        setArchivos(null);
        setPortada("");
        e.target.reset();
      } else {
        setMensaje("⚠️ No se pudo subir ningún archivo. Inténtalo de nuevo.");
      }
    } catch (err) {
      setMensaje("⚠️ Error de conexión. Inténtalo de nuevo.");
    }

    setProgreso("");
    setSubiendo(false);
  };

  const listaArchivos = archivos ? Array.from(archivos) : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100 px-4 py-14">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="inline-block text-sm text-neutral-500 hover:text-neutral-700 mb-4"
        >
          ← Volver al inicio
        </Link>

        <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-neutral-500">
            Hola, <span className="font-medium text-neutral-700">{session.user?.name}</span> 👋
          </p>
          <button
            onClick={() => signOut()}
            className="text-sm text-neutral-400 hover:text-neutral-600 underline"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] p-6">
          <h1 className="text-2xl font-black text-center text-neutral-800 mb-1">
            Subir recuerdos
          </h1>
          <p className="text-center text-neutral-400 text-sm mb-6">
            Fotos y vídeos de tu próximo viaje ✈️
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1 block">
                Nombre del viaje
              </label>
              <input
                type="text"
                placeholder="Ej: Nantes 2026 🇫🇷"
                value={nombreViaje}
                onChange={(e) => setNombreViaje(e.target.value)}
                className="w-full bg-orange-50 rounded-xl px-4 py-3 outline-none border border-transparent focus:border-orange-300 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1 block">
                Fotos y vídeos
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => {
                  setArchivos(e.target.files);
                  setPortada("");
                }}
                className="w-full bg-orange-50 rounded-xl px-4 py-3 text-sm border border-transparent file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-neutral-800 file:text-white file:text-xs"
              />
            </div>

            {listaArchivos.length > 0 && (
              <div className="bg-sky-50 rounded-xl px-4 py-3">
                <p className="text-xs font-medium text-neutral-500 mb-2">
                  ⭐ ¿Cuál quieres de portada? (opcional)
                </p>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                  <label className="flex items-center gap-2 text-sm text-neutral-600">
                    <input
                      type="radio"
                      name="portada"
                      checked={portada === ""}
                      onChange={() => setPortada("")}
                    />
                    Automática (la primera que se procese)
                  </label>
                  {listaArchivos.map((archivo) => (
                    <label
                      key={archivo.name}
                      className="flex items-center gap-2 text-sm text-neutral-600"
                    >
                      <input
                        type="radio"
                        name="portada"
                        checked={portada === archivo.name}
                        onChange={() => setPortada(archivo.name)}
                      />
                      {archivo.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={subiendo}
              className="bg-neutral-800 text-white rounded-full px-4 py-3 font-medium hover:bg-neutral-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-md mt-2"
            >
              {subiendo ? (progreso || "Subiendo…") : "Subir"}
            </button>
          </form>

          {mensaje && (
            <div className="mt-4 text-center">
              <p className="text-sm text-neutral-600">{mensaje}</p>
              {mensaje.startsWith("✅") && (
                <Link
                  href="/"
                  className="inline-block mt-3 text-sm text-white bg-neutral-800 px-5 py-2 rounded-full hover:bg-neutral-700 transition-colors"
                >
                  Volver al inicio
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}