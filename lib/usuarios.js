// Lee la variable USUARIOS y la convierte en un mapa { email: idDeCarpetaRaiz }
// Formato esperado: "email1:idCarpeta1,email2:idCarpeta2"
export function getUsuarios() {
  const raw = process.env.USUARIOS || "";
  const mapa = {};

  raw.split(",").forEach((par) => {
    const [email, rootId] = par.split(":").map((s) => s?.trim());
    if (email && rootId) {
      mapa[email.toLowerCase()] = rootId;
    }
  });

  return mapa;
}