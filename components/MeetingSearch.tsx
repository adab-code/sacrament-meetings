// Buscador de reuniones con debounce de 300 ms. Al escribir actualiza la URL
// (?query=) con router.replace y resetea la paginación a la página 1.
// Usa hooks de next/navigation, por lo que es un componente cliente.
"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function MeetingSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // always reset to page 1 on a new search
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative w-full">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-700/50"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
        />
      </svg>
      <input
        type="search"
        placeholder="Search by speaker, leader, or meeting type..."
        defaultValue={searchParams.get("query")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        aria-label="Search meetings"
        className="w-full rounded-full border border-cream-200 bg-white py-3 pl-12 pr-5 text-sm text-navy-900 shadow-sm outline-none transition-colors placeholder:text-ink-700/60 hover:border-cream-300 focus:border-gold-500/60 focus:ring-2 focus:ring-gold-400/40"
      />
    </div>
  );
}