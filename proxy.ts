// Proxy de la aplicación (Semana 05 · autenticación).
//
// En Next.js 16 este archivo se llama `proxy.ts` —antes `middleware.ts`— y la
// función que se exporta debe llamarse `proxy`. Corre en el runtime de Node en
// cada petición, antes de renderizar la página, y es lo que manda a /login a
// quien intente abrir /meetings/new o /meetings/<id>/edit sin sesión.
//
// Importa únicamente `auth.config.ts`: bcrypt y la base de datos no pueden
// entrar en este bundle.
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// El wrapper de Auth.js se renombra a `proxy` para cumplir la convención de
// Next.js 16. Auth.js se limita a leer la cookie de sesión y a ejecutar el
// callback `authorized` de auth.config.ts; la decisión de qué rutas están
// protegidas vive allí, no aquí.
export const proxy = NextAuth(authConfig).auth;

export const config = {
  // Se salta los ficheros estáticos y los assets de Next. El prefijo `api`
  // queda fuera a propósito: los endpoints de Auth.js los sirve el route handler
  // app/api/auth/[...nextauth]/route.ts, no el proxy.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
