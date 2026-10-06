// Formulario de inicio de sesión del bishopric (Semana 05).
//
// Client Component porque depende de useActionState para leer el estado que
// devuelve `authenticate` (el mensaje de "Invalid email or password") y para
// saber si el envío está en curso. El resto —comprobar el hash, tocar la base de
// datos— ocurre en el servidor: este archivo no importa nada de `lib/`.
//
// Se envía con un <form action={...}> de verdad, no con onSubmit, así que el
// nonce de Server Action viaja en campos ocultos y el formulario seguiría
// funcionando igual con JavaScript desactivado (con la salvedad de que sin JS no
// hay mensaje de error legible).
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate } from "@/lib/actions";

// Botón que se deshabilita a sí mismo mientras la acción está en curso.
// useFormStatus sólo funciona dentro de un <form>, de ahí el componente aparte.
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/25 transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

interface LoginFormProps {
  // A dónde volver tras iniciar sesión. Lo pasa la página de login y llega en un
  // campo oculto; `authenticate` lo lee a través de signIn(), que usa el valor
  // `redirectTo` del FormData como callbackUrl.
  redirectTo: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const [errorMessage, formAction] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="mt-8">
      {/* Callback de Auth.js. Sin esto, signIn() usaría la cabecera Referer
          (/login) y el usuario volvería a la página de login. */}
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-navy-900"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-1.5 w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-navy-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-navy-900"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="mt-1.5 w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-navy-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40"
        />
      </div>

      {/* role="alert" para que un lector de pantalla anuncie el fallo en cuanto
          aparece, sin que el usuario tenga que ir a buscarlo. */}
      {errorMessage ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorMessage}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
