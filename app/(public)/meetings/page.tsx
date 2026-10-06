// Listado público de reuniones con búsqueda y paginación.
// Server Component que lee query/page desde la URL (searchParams), por lo que
// la ruta es dinámica y su estado de carga lo gestiona loading.tsx.
//
// También resuelve la sesión (Semana 05) para decidir si se pintan los controles
// de administración. Se lee una sola vez por página y se reparte como prop a las
// tarjetas, en lugar de llamar a auth() una vez por reunión.
import type { Metadata } from "next";
import Link from "next/link";
import MeetingCard from "@/components/MeetingCard";
import { MeetingSearch } from "@/components/MeetingSearch";
import { Pagination } from "@/components/Pagination";
import { auth } from "@/auth";
import { getMeetings, getMeetingsTotalPages } from "@/lib/meetings-db";

// Metadatos del listado (Semana 05): título y descripción propios del route
// segment, sobre los por defecto del layout raíz.
export const metadata: Metadata = {
  title: "Meetings",
  description:
    "Search recent and upcoming sacrament meeting agendas: presiding, conducting, speakers and meeting type.",
};

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const { query, page } = await searchParams;
  const safeQuery = query ?? "";
  // Página actual de la URL (fallback 1 si no viene o no es numérica).
  const currentPage = Number(page) || 1;

  // Sesión y datos del listado en paralelo: no dependen entre sí.
  const [session, meetings, totalPages] = await Promise.all([
    auth(),
    getMeetings(safeQuery, currentPage),
    getMeetingsTotalPages(safeQuery),
  ]);

  const isSignedIn = !!session?.user;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 print:mb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
            Weekly Programs
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-navy-900">
            Meetings
          </h1>
          <p className="mt-2 text-ink-700">
            Search recent and upcoming sacrament meeting agendas.
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-3">
          <Link
            href="/meetings/current"
            className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/25 transition-all hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-xl"
          >
            This Sunday
          </Link>
          {/* El enlace de alta sólo existe para el bishopric: sin sesión lleva a
              /login, que es el comportamiento correcto, pero sería un botón
              muerto en la UI. */}
          {isSignedIn ? (
            <Link
              href="/meetings/new"
              className="rounded-full border border-gold-500/60 bg-white px-6 py-3 text-sm font-semibold text-gold-700 transition-all hover:-translate-y-0.5 hover:border-gold-600 hover:bg-gold-400/10"
            >
              New meeting
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <MeetingSearch />
      </div>

      {meetings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-6 py-16 text-center">
          <p className="font-display text-xl font-semibold text-navy-900">
            No meetings yet
          </p>
          <p className="mt-2 text-ink-700">
            Check back soon for upcoming sacrament meeting programs.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              isSignedIn={isSignedIn}
            />
          ))}
        </div>
      )}

      <Pagination totalPages={totalPages} />
    </>
  );
}