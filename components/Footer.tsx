// Pie de página global con marca, enlaces de navegación y año actual.
import Link from "next/link";
import { WARD_NAME } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="no-print mt-auto bg-navy-900 text-cream-100">
      <div className="h-1 w-full bg-gradient-to-r from-gold-500 via-cream-300 to-gold-500" />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-xl font-semibold tracking-tight text-cream-50">
            {WARD_NAME}
          </p>
          <p className="mt-2 text-sm leading-6 text-cream-100/70">
            Weekly programs for sacrament meeting — hymns, prayers, speakers,
            and announcements for the ward community.
          </p>
        </div>
        <nav
          className="flex flex-col gap-2 text-sm"
          aria-label="Footer navigation"
        >
          <Link
            href="/meetings"
            className="text-cream-100/80 transition-colors hover:text-gold-300"
          >
            All meetings
          </Link>
          <Link
            href="/meetings/current"
            className="text-cream-100/80 transition-colors hover:text-gold-300"
          >
            This Sunday
          </Link>
        </nav>
        <p className="text-sm text-cream-100/60">
          &copy; {new Date().getFullYear()} {WARD_NAME}
        </p>
      </div>
    </footer>
  );
}