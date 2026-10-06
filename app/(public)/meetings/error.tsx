// Frontera de error de las rutas públicas de reuniones (/meetings, /meetings/
// current y /meetings/[id]). Next.js la renderiza cuando una excepción llega
// sin capturar — por ejemplo, si la base de datos no responde.
//
// Debe ser un Client Component: usa useEffect para registrar el error y un
// botón para reintentar el render del segmento.
"use client";

import Link from "next/link";
import { useEffect } from "react";

interface MeetingsErrorProps {
  error: Error & { digest?: string };
  // Next.js 16 recomienda retry() (re-pide los datos y vuelve a renderizar el
  // segmento). reset() sigue existiendo y sólo limpia el estado del límite.
  retry?: () => void;
  reset?: () => void;
}

export default function MeetingsError({
  error,
  retry,
  reset,
}: MeetingsErrorProps) {
  useEffect(() => {
    console.error("Unhandled error in the meetings routes:", error);
  }, [error]);

  const recover = retry ?? reset;

  return (
    <div className="rounded-2xl border border-cream-200 bg-white px-6 py-16 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
        Something went wrong
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
        We could not load the meetings
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-700">
        An unexpected error stopped this page from rendering. Trying again
        often fixes it.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-ink-700">
          Reference: <span className="font-mono">{error.digest}</span>
        </p>
      ) : null}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {recover ? (
          <button
            type="button"
            onClick={recover}
            className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-navy-900/25 transition hover:bg-navy-800"
          >
            Try again
          </button>
        ) : null}
        <Link
          href="/meetings"
          className="rounded-full border border-cream-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-cream-100"
        >
          Go back to all meetings
        </Link>
      </div>
    </div>
  );
}