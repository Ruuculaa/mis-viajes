import Gallery from "./Gallery";
import { getFotos } from "@/lib/drive";

export default async function Nantes2026() {
  const fotos = await getFotos(process.env.NANTES2026_FOLDER_ID);
  return <Gallery titulo="Nantes 2026" fotos={fotos} />;
}