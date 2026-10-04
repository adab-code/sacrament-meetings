// Layout del grupo de rutas (admin).
//
// Las páginas de este grupo (/meetings/new y /meetings/<id>/edit) están
// protegidas desde la Semana 05: el proxy las manda a /login sin sesión y sus
// Server Actions vuelven a comprobar la sesión con requireAuth() antes de
// escribir. Este layout sólo aporta el shell; la autorización vive en
// auth.config.ts y en lib/actions.ts.
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex w-full flex-1 flex-col items-center py-8">
      <section className="w-full max-w-4xl px-5">{children}</section>
    </main>
  );
}