// Configuración de Auth.js v5 que se carga en el proxy (Semana 05).
//
// Este es el ÚNICO archivo de Auth.js que entra en el bundle del proxy, que se
// ejecuta en cada petición antes de renderizar la página. Por eso no puede
// importar bcrypt ni `lib/users-db.ts`: la comparación de contraseñas y la
// consulta a Neon viven en `auth.ts`, que sólo se usa en el servidor. Los
// providers también se añaden allí; aquí la lista va vacía a propósito.
import type { NextAuthConfig } from "next-auth";

// Rutas reservadas al bishopric. El grupo de rutas `(admin)` no aporta segmento
// de URL, así que hay que comparar contra los paths reales que ambos grupos
// generan: /meetings/new y /meetings/<id>/edit. Todo lo demás —el listado, el
// detalle, /meetings/current y la API de sólo lectura— es público.
const NEW_MEETING_PATH = "/meetings/new";

// /meetings/12/edit. El id se acepta como cualquier segmento no vacío porque
// el page.tsx de ese segmento ya lo valida con Number.isInteger y llama a
// notFound() si no es un entero válido.
const EDIT_MEETING_PATTERN = /^\/meetings\/[^/]+\/edit\/?$/;

const LOGIN_PATH = "/login";

// ¿Esta ruta necesita sesión? Se exporta para que los tests y el resto de la
// app compartan exactamente la misma definición de "ruta protegida".
export function isProtectedPath(pathname: string): boolean {
  return (
    pathname === NEW_MEETING_PATH ||
    pathname.startsWith(`${NEW_MEETING_PATH}/`) ||
    EDIT_MEETING_PATTERN.test(pathname)
  );
}

export const authConfig = {
  pages: {
    // Sustituye la página de login que trae Auth.js por la nuestra.
    signIn: LOGIN_PATH,
  },
  callbacks: {
    // Se ejecuta en el proxy, antes de que se renderice la página.
    authorized({ auth, request: { nextUrl } }) {
      // Se comprueba `auth?.user` y no `auth`. Si la configuración de Auth.js
      // está rota (por ejemplo, si en el despliegue falta AUTH_SECRET), el
      // objeto `auth` llega poblado con un objeto de error, que es truthy, y
      // `!!auth` le daría acceso a todo el mundo: la comprobación fallaría
      // ABIERTA. Mirar una propiedad concreta hace que falle cerrada.
      const isLoggedIn = !!auth?.user;

      if (isProtectedPath(nextUrl.pathname)) {
        // Devolver false le dice a Auth.js que redirija a pages.signIn
        // añadiendo ?callbackUrl=<la URL que se intentaba abrir>.
        return isLoggedIn;
      }

      // Un usuario con sesión no tiene nada que hacer en /login. El destino
      // (/meetings) es una ruta pública, así que este redirect no puede
      // encadenarse con el branch anterior.
      //
      // Nota: el material de referencia de la semana hace aquí un
      // `redirect("/dashboard")` para CUALQUIER ruta pública de un usuario con
      // sesión. Ese comportamiento no se copia porque esta app es pública con
      // una sección admin: expulsaría al bishopric de la home y de cada
      // detalle de reunión cada vez que iniciara sesión.
      if (isLoggedIn && nextUrl.pathname === LOGIN_PATH) {
        return Response.redirect(new URL("/meetings", nextUrl));
      }

      return true;
    },
  },
  providers: [], // se rellenan en auth.ts
} satisfies NextAuthConfig;
