// 404 raíz. Next.js lo usa para las URLs que no coinciden con ninguna ruta y
// como última respaldo cuando un not-found.tsx más específico no existe.
import type { Metadata } from "next";
import Link from "next/link";

// Sin este título, una página de error que no declara el suyo hereda el `default`
// del layout raíz ("Provo 1st Ward · Sacrament Meeting Planner"), que describe el
// sitio y no el error. En un 404 conviene decirlo explícitamente.
export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
        Page not found
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-700">
        The page you are looking for does not exist.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/60 bg-white px-5 py-2.5 text-sm font-semibold text-gold-700 transition-colors hover:border-gold-600 hover:bg-gold-400/10"
        >
          All meetings
        </Link>
        <Link
          href="/"
          className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-navy-900/25 transition hover:bg-navy-800"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}