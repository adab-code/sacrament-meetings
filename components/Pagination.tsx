// Controles anterior/siguiente de la paginación. Lee la página actual de la
// URL (?page=) y construye los enlaces preservando el resto de parámetros
// (p. ej. el término de búsqueda query).
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationLinkProps {
  href: string;
  label: string;
  direction: "previous" | "next";
}

function PaginationLink({ href, label, direction }: PaginationLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-full border border-cream-200 bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-500/60 hover:bg-gold-400/10 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gold-400/50"
    >
      {direction === "previous" && (
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      )}
      {label}
      {direction === "next" && (
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      )}
    </Link>
  );
}

export function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  if (totalPages <= 1) {
    return null;
  }

  function createPageURL(page: number): string {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between gap-4"
    >
      {currentPage > 1 ? (
        <PaginationLink
          href={createPageURL(currentPage - 1)}
          label="Previous page"
          direction="previous"
        />
      ) : (
        <span aria-hidden="true" />
      )}
      <span className="text-sm text-ink-700">
        Page{" "}
        <span className="inline-flex min-w-7 justify-center rounded-full bg-navy-900 px-2.5 py-0.5 font-display font-semibold text-gold-300">
          {currentPage}
        </span>{" "}
        of {totalPages}
      </span>
      {currentPage < totalPages ? (
        <PaginationLink
          href={createPageURL(currentPage + 1)}
          label="Next page"
          direction="next"
        />
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}