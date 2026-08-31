import { getUsuarios } from "./usuarios";

// Lee papelera.json dentro de una carpeta cualquiera (lectura pública, no requiere sesión)
export async function leerPapelera(folderId) {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const vacio = { ocultos: [], contador: 0 };

  if (!apiKey || !folderId) return vacio;

  const query = encodeURIComponent(
    `'${folderId}' in parents and name = 'papelera.json' and trashed = false`
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)&key=${apiKey}`,
    { next: { revalidate: 5 } }
  );
  const data = await res.json();
  const archivo = data.files?.[0];
  if (!archivo) return vacio;

  try {
    const contenidoRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${archivo.id}?alt=media&key=${apiKey}`,
      { next: { revalidate: 5 } }
    );
    const json = await contenidoRes.json();
    return { ocultos: json.ocultos || [], contador: json.contador || 0 };
  } catch {
    return vacio;
  }
}

// Papelera de VIAJES (a nivel de carpeta general del propietario) - se mantiene igual que antes
export async function getOcultos() {
  const usuarios = getUsuarios();
  const rootId = usuarios[process.env.OWNER_EMAIL?.toLowerCase()];
  return leerPapelera(rootId);
}