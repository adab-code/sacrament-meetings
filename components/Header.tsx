// Cabecera global: inicial del ward, nombre, fecha actual y navegación
// principal. Lleva la clase no-print para ocultarse al imprimir.
import Link from "next/link";
import { WARD_NAME } from "@/lib/config";
import NavLinks from "./NavLinks";

export default function Header() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="no-print border-b border-cream-200 bg-cream-50/80 backdrop-blur-sm">
      <div className="h-1 w-full bg-gradient-to-r from-gold-500 via-navy-800 to-gold-500" />
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 font-display text-xl font-semibold text-gold-300 shadow-md shadow-navy-900/20">
            {WARD_NAME.charAt(0)}
          </span>
          <div>
            <Link
              href="/"
              className="font-display text-2xl font-semibold tracking-tight text-navy-900 transition-colors hover:text-navy-700"
            >
              {WARD_NAME}
            </Link>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-700">
              Sacrament Meeting
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="hidden items-center gap-2 text-sm text-ink-700 md:inline-flex">
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-gold-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            {today}
          </p>
          <NavLinks />
        </div>
      </div>
    </header>
  );
}