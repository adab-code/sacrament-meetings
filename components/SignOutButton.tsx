// Botón de cierre de sesión (Semana 05).
//
// Server Component: el Server Action va en un <form action={...}> en línea, que
// es el patrón que recomienda Next.js para cerrar sesión. La función lleva su
// propio "use server" y así el archivo entero no tiene que ser cliente.
//
// Se cierra sesión y se vuelve a la home, que es pública: si el usuario estuviera
// en /meetings/<id>/edit al pulsar el botón, redirigir a "/" lo deja siempre en
// un sitio al que puede llegar sin sesión.
import { signOut } from "@/auth";

interface SignOutButtonProps {
  className?: string;
}

export default function SignOutButton({
  className = "rounded-full border border-cream-200 bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition hover:border-gold-400 hover:bg-gold-400/10",
}: SignOutButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}
