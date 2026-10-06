// Página de inicio de sesión (/login) — Semana 05.
//
// Server Component: no necesita estado de cliente, sólo leer el `callbackUrl`
// de la URL y sanitizarlo antes de meterlo en el formulario. Si el usuario fue
// expulsado de /meetings/new, el proxy le dejó aquí un ?callbackUrl= con la ruta
// que intentaba abrir, y al iniciar sesión vuelve justo allí.
//
// Esta ruta vive fuera del grupo (admin) a propósito: si estuviera dentro, el
// proxy la trataría como protegida y nadie podría llegar nunca a authenticate.
import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";
import { WARD_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to manage the sacrament meeting schedule for ${WARD_NAME}.`,
};

// Destino por defecto si no hay callbackUrl válido.
const FALLBACK_REDIRECT = "/meetings";

/**
 * Sanea el callbackUrl para que sólo pueda ser una ruta interna.
 *
 * Sin esto, un enlace como /login?callbackUrl=https://sitio-malicioso.example
 * convertiría el login en un open redirect: el usuario inicia sesión en una app
 * legítima y aterriza en otra. Se rechazan las URL absolutas y las rutas
 * protocol-relative ("//evil.example"), que empiezan por "/" pero el navegador
 * las trata como otro dominio.
 */
function safeRedirectPath(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return FALLBACK_REDIRECT;
  }

  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return FALLBACK_REDIRECT;
  }

  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex w-full flex-1 items-center justify-center py-16">
      <div className="w-full max-w-sm px-5">
        <div className="rounded-2xl border border-cream-200 bg-white p-8 shadow-xl shadow-navy-900/10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
            {WARD_NAME}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
            Sign in
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-700">
            The bishopric uses this page to manage the sacrament meeting
            schedule. Everyone else can browse the agendas without an account.
          </p>

          <LoginForm redirectTo={safeRedirectPath(callbackUrl)} />
        </div>
      </div>
    </main>
  );
}
