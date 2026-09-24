// Ruta "This Sunday" (/meetings/current): busca la reunión del próximo domingo
// (nextSunday). Si existe redirige a su detalle; si no, muestra un estado
// vacío claro en lugar de rebotar al listado. force-dynamic evita cacheo.
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMeetingByDate } from "@/lib/meetings-db";
import { nextSunday, toISODate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function CurrentMeetingPage() {
  const current = await getMeetingByDate(toISODate(nextSunday()));

  if (current) {
    redirect(`/meetings/${current.id}`);
  }

  return (
    <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
        This Sunday
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
        No meeting scheduled yet
      </h1>
      <p className="mt-3 text-ink-700">
        The agenda for this Sunday is not available yet. Check back soon.
      </p>
      <Link
        href="/meetings"
        className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-gold-500/60 bg-white px-5 py-2.5 text-sm font-semibold text-gold-700 transition-colors hover:border-gold-600 hover:bg-gold-400/10"
      >
        View all meetings
      </Link>
    </div>
  );
}