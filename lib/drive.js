import { slugify } from "./slug";

// Lista todas las subcarpetas (viajes) dentro de la carpeta raíz
export async function getViajes() {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const rootId = process.env.ROOT_FOLDER_ID;

  if (!rootId || !apiKey) return [];

  const query = `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,createdTime)&orderBy=createdTime desc&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();

  if (!data.files) return [];

  return data.files.map((f) => ({
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
  )}&fields=files(id,name,mimeType)&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();

  if (!data.files) return [];

  return data.files.map((f) => {
    const esVideo = f.mimeType.startsWith("video/");
    return {
      id: f.id,
      tipo: esVideo ? "video" : "imagen",
      thumb: `https://lh3.googleusercontent.com/d/${f.id}=w500`,
      full: `https://lh3.googleusercontent.com/d/${f.id}=w1600`,
    };
  });
}