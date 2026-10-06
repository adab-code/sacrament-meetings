// Configuración completa de Auth.js v5 (Semana 05 · autenticación).
//
// A diferencia de `auth.config.ts`, este archivo SÍ toca la base de datos y
// bcrypt: nunca se importa desde el proxy, sólo desde el servidor (Server
// Components, Server Actions y el route handler de /api/auth/*).
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { getUserByEmail } from "@/lib/users-db";

// Validación de lo que llega del formulario antes de tocar la base de datos.
// El mínimo de 8 caracteres coincide con la regla del script de alta y sólo
// sirve para descartar intentos absurdos con un mensaje claro: la contraseña que
// vale es la que concuerda con el hash de bcrypt.
const credentialsSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,

  // Sin adapter: la sesión vive en un JWT firmado en una cookie, así que no
  // hace falta ninguna tabla de sesiones en Neon. La lista de usuarios sí es
  // real (tabla "users"), pero la sesión no necesita persistirse.
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // Devuelve el usuario si las credenciales son válidas y `null` si no.
      // Auth.js convierte ese `null` en un error CredentialsSignin, que
      // `authenticate` (lib/actions.ts) traduce al mensaje que ve el usuario.
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await getUserByEmail(email);

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!passwordMatches) {
          return null;
        }

        // Todo lo que se devuelve aquí acaba dentro del JWT firmado, así que
        // `passwordHash` no puede aparecer en este objeto. `id` va como texto
        // porque Auth.js lo guarda en el `sub` del token, que es un string.
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Se conserva el `authorized` de auth.config.ts (lo necesita el proxy) y se
    // añaden los dos callbacks que rellenan el JWT y la sesión.
    ...authConfig.callbacks,

    // Al iniciar sesión se copia el rol al token...
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },

    // ...y de ahí a `session.user`, que es lo que leen los Server Components con
    // `await auth()`. El rol viaja en el JWT precisamente para no tener que
    // consultar Neon en cada lectura de sesión.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "bishopric";
      }
      return session;
    },
  },
});
