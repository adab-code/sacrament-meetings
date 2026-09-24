// Layout del grupo de rutas (admin). El scaffolding de autenticación
// (login/roles) se añadirá en la Semana 05.
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex w-full flex-1 flex-col items-center py-8">
      <section className="w-full max-w-4xl px-5">{children}</section>
    </main>
  );
}