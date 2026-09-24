// GET /api/meetings
// Listado con paginación y búsqueda (?query=, ?page=).
// Además soporta ?date=YYYY-MM-DD para resolver una fecha concreta.
import { getMeetings, getMeetingByDate } from "@/lib/meetings-db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const query = url.searchParams.get("query") ?? "";
  // Página actual; fallback a 1 si no viene o no es numérica.
  const currentPage = Number(url.searchParams.get("page")) || 1;

  // Acceso directo por fecha: devuelve la reunión (o array vacío).
  if (date) {
    const meeting = await getMeetingByDate(date);
    return Response.json(meeting ? [meeting] : []);
  }

  const meetings = await getMeetings(query, currentPage);
  return Response.json(meetings);
}