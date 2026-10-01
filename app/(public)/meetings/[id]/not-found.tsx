// 404 del segmento /meetings/[id]: la página llama a notFound() cuando el id
// no es válido o la reunión ya no existe en la base de datos.
import Link from "next/link";

export default function MeetingNotFound() {
  return (
    <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
        Meeting not found
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-700">
        This agenda does not exist. It may have been removed, or the link may be
        incomplete.
      </p>
      <Link
        href="/meetings"
        className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-gold-500/60 bg-white px-5 py-2.5 text-sm font-semibold text-gold-700 transition-colors hover:border-gold-600 hover:bg-gold-400/10"
      >
        Back to all meetings
      </Link>
    </div>
  );
}