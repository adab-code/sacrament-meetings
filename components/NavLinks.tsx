"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/meetings", label: "Meetings" },
];

export default function NavLinks() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      className="flex items-center gap-1.5 rounded-full border border-cream-200 bg-white p-1.5 shadow-sm"
      aria-label="Main navigation"
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