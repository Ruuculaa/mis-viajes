const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

// Busca una carpeta por nombre dentro del padre; si no existe, la crea y la hace pública (solo lectura)
export async function buscarOCrearCarpeta(nombre, parentId, accessToken) {
  const nombreEscapado = nombre.replace(/'/g, "\\'");
  const q = encodeURIComponent(
    `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${nombreEscapado}' and trashed = false`
  );

  const res = await fetch(`${DRIVE_API}/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (data.files && data.files.length > 0) return data.files[0].id;

  const createRes = await fetch(`${DRIVE_API}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: nombre,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
  const nueva = await createRes.json();

  // La compartimos como "cualquiera con el enlace puede ver" para que la galería la muestre
  await fetch(`${DRIVE_API}/files/${nueva.id}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });

  return nueva.id;
}

export async function subirArchivo(file, folderId, accessToken) {
  const metadata = { name: file.name, parents: [folderId] };
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", file);

  const res = await fetch(
    `${UPLOAD_API}/files?uploadType=multipart&fields=id,name`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );
  return res.json();
}

// Marca un archivo como portada (destacado) y quita la marca de la anterior portada de esa carpeta
export async function marcarComoPortada(folderId, fileId, accessToken) {
  const query = encodeURIComponent(
    `'${folderId}' in parents and starred = true and trashed = false`
  );
  const res = await fetch(`${DRIVE_API}/files?q=${query}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();

  for (const f of data.files || []) {
    await fetch(`${DRIVE_API}/files/${f.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ starred: false }),
    });
  }

  await fetch(`${DRIVE_API}/files/${fileId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ starred: true }),
  });
}

// Crea o actualiza el archivo papelera.json dentro de la carpeta raíz
export async function actualizarPapelera(rootId, nuevoContenido, accessToken) {
  const query = encodeURIComponent(
    `'${rootId}' in parents and name = 'papelera.json' and trashed = false`
  );
  const res = await fetch(`${DRIVE_API}/files?q=${query}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  const existente = data.files?.[0];
  const contenidoStr = JSON.stringify(nuevoContenido);

  if (existente) {
    await fetch(`${UPLOAD_API}/files/${existente.id}?uploadType=media`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: contenidoStr,
    });
    return existente.id;
  }

  const metadata = {
    name: "papelera.json",
    parents: [rootId],
    mimeType: "application/json",
  };
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", new Blob([contenidoStr], { type: "application/json" }));

  const createRes = await fetch(
    `${UPLOAD_API}/files?uploadType=multipart&fields=id`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );
  const nuevo = await createRes.json();

  // La hacemos legible públicamente para que la web pueda consultarla sin sesión
  await fetch(`${DRIVE_API}/files/${nuevo.id}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });

  return nuevo.id;
}