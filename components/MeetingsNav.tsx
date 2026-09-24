// Navegación interna de la sección de reuniones. Componente cliente porque
// detecta la ruta activa con usePathname (aria-current="page").
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/meetings", label: "All meetings" },
  { href: "/meetings/current", label: "This Sunday" },
];

export default function MeetingsNav() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/meetings/current") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      className="no-print mb-8 inline-flex items-center gap-1 rounded-full border border-cream-200 bg-white p-1 shadow-sm"
      aria-label="Meetings section"
    >
      {links.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-navy-900 text-white shadow-md shadow-navy-900/20"
                : "text-ink-700 hover:bg-cream-200/60 hover:text-navy-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}