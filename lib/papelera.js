import { getUsuarios } from "./usuarios";

// Lee el estado de la papelera (lectura pública, no requiere sesión)
// La papelera vive siempre dentro de la carpeta raíz del propietario
export async function getOcultos() {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const usuarios = getUsuarios();
  const rootId = usuarios[process.env.OWNER_EMAIL?.toLowerCase()];
  const vacio = { ocultos: [], contador: 0 };

  if (!apiKey || !rootId) return vacio;

  const query = encodeURIComponent(
    `'${rootId}' in parents and name = 'papelera.json' and trashed = false`
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