import { slugify } from "./slug";
import { getOcultos } from "./papelera";

// Lista todas las subcarpetas (viajes) dentro de la carpeta raíz, excluyendo las ocultas
export async function getViajes() {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const rootId = process.env.ROOT_FOLDER_ID;

  if (!rootId || !apiKey) return [];

  const query = `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,createdTime)&orderBy=createdTime desc&key=${apiKey}`;

  const [res, { ocultos }] = await Promise.all([
    fetch(url, { next: { revalidate: 60 } }),
    getOcultos(),
  ]);
  const data = await res.json();

  if (!data.files) return [];

  return data.files
    .filter((f) => f.name !== "papelera.json" && !ocultos.includes(f.id))
    .map((f) => ({
      id: f.id,
      nombre: f.name,
      slug: slugify(f.name),
    }));
}

// Dado un ID de carpeta, devuelve sus fotos Y vídeos
export async function getFotos(folderId) {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  if (!folderId || !apiKey) return [];

  const query = `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/')`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,thumbnailLink,starred)&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();

  if (!data.files) return [];

  return data.files.map((f) => {
    const esVideo = f.mimeType.startsWith("video/");
    // thumbnailLink oficial de Google, ej: ...=s220. Lo agrandamos para la versión "full".
    const base = f.thumbnailLink || `https://lh3.googleusercontent.com/d/${f.id}`;
    return {
      id: f.id,
      tipo: esVideo ? "video" : "imagen",
      thumb: base,
      full: base.replace(/=s\d+/, "=s1600"),
      starred: f.starred || false,
    };
  });
}