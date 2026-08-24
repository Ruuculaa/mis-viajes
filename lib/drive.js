import { slugify } from "./slug";
import { getOcultos } from "./papelera";
import { getUsuarios } from "./usuarios";

async function listarSubcarpetas(rootId, apiKey) {
  const query = `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,createdTime)&orderBy=createdTime desc&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  return data.files || [];
}

// Lista todos los viajes de todas las carpetas raíz de todos los usuarios, excluyendo los ocultos
export async function getViajes() {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const raices = [...new Set(Object.values(getUsuarios()))];

  if (raices.length === 0 || !apiKey) return [];

  const [listas, { ocultos }] = await Promise.all([
    Promise.all(raices.map((rootId) => listarSubcarpetas(rootId, apiKey))),
    getOcultos(),
  ]);

  const todos = listas.flat();

  return todos
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