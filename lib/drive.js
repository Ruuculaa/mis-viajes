// Función reutilizable: dado un ID de carpeta de Google Drive, devuelve sus fotos Y vídeos.
export async function getFotos(folderId) {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  if (!folderId || !apiKey) return [];

  const query = `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/')`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType)&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 3600 } }); // recachea cada hora
  const data = await res.json();

  if (!data.files) return [];

  return data.files.map((f) => {
    const esVideo = f.mimeType.startsWith("video/");
    return {
      id: f.id,
      tipo: esVideo ? "video" : "imagen",
      // Miniatura: Drive genera una imagen de portada también para vídeos
      thumb: `https://lh3.googleusercontent.com/d/${f.id}=w500`,
      // Para imágenes: versión grande. Para vídeos no se usa (se reproduce con iframe).
      full: `https://lh3.googleusercontent.com/d/${f.id}=w1600`,
    };
  });
}