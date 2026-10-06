// Frontera de error de las rutas de administración de reuniones (/meetings/new
// y /meetings/[id]/edit). Recoge los fallos inesperados que lanzan los Server
// Actions tras reintentarlo, para que un error de base de datos no deje al
// usuario en una pantalla en blanco.
"use client";

import Link from "next/link";
import { useEffect } from "react";

interface AdminMeetingsErrorProps {
  error: Error & { digest?: string };
  // Next.js 16 recomienda retry() (re-pide los datos y vuelve a renderizar el
  // segmento). reset() sigue existiendo y sólo limpia el estado del límite.
  retry?: () => void;
  reset?: () => void;
}

export default function AdminMeetingsError({
  error,
  retry,
  reset,
}: AdminMeetingsErrorProps) {
  useEffect(() => {
    console.error("Unhandled error in the meetings admin routes:", error);
  }, [error]);

  const recover = retry ?? reset;

  return (
    <div className="rounded-2xl border border-red-200 bg-white px-6 py-16 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
        Admin
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
        Something went wrong
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-700">
        The meeting could not be saved. Nothing was changed, so you can safely
        try again.
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