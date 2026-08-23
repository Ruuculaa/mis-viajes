import Gallery from "./Gallery";
import { getFotos } from "@/lib/drive";

export default async function Milan2025() {
  const fotos = await getFotos(process.env.MILAN2025_FOLDER_ID);
  return <Gallery titulo="Milán 2025" fotos={fotos} />;
}