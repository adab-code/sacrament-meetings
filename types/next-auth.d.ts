// Ampliación de los tipos de Auth.js v5 (Semana 05 · autenticación).
//
// `authorize` (en auth.ts) devuelve un usuario con `role`, y ese dato viaja al
// JWT y de ahí a `session.user`. Auth.js no conoce ese campo, así que se declara
// aquí: si no, `session.user.role` y `token.role` serían `unknown` y cada
// lectura tendría que ir acompañada de un cast.
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  // Lo que `authorize` devuelve y Auth.js copia al token al iniciar sesión.
  interface User {
    role: string;
  }

  // Lo que los Server Components leen con `await auth()`. `id` es el id de la
  // tabla "users" de Neon, en texto porque el JWT lo guarda en `sub`.
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

// El `JWT` se amplía sobre "@auth/core/jwt" y no sobre "next-auth/jwt" porque el
// módulo de next-auth sólo hace `export * from "@auth/core/jwt"`: no declara la
// interfaz, así que una ampliación ahí no se fusionaría con ella y `token.role`
// seguiría siendo `unknown` (que es lo que hace `token.role ?? "bishopric"` fallar
// al tipar). @auth/core es una dependencia transitiva de next-auth; si algún día
// Auth.js cambia esa estructura, este archivo es el único sitio que hay que tocar.
declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
  }
}
