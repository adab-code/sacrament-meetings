// 404 del segmento /meetings/[id]/edit: el id de la URL no corresponde a
// ninguna reunión (o no es un entero válido) y la página llamó a notFound().
// notFound() tiene prioridad sobre error.tsx, así que este es el mensaje que ve
// el usuario en lugar de una pantalla de error.
import Link from "next/link";

export default function EditMeetingNotFound() {
  return (
    <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
        Admin
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
        Meeting not found
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-700">
        There is no meeting with that id, so there is nothing to edit. It may
        have been deleted already.
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