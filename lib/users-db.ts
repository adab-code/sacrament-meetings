// Capa de acceso a datos de las cuentas (Semana 05 · autenticación).
//
// Sigue el mismo patrón que `meetings-db.ts`: cliente Neon perezoso (getDb) para
// poder compilar sin DATABASE_URL en el entorno y sólo exigirla en tiempo de
// ejecución. Se mantiene separado de `meetings-db.ts` a propósito — son dos
// dominios distintos y así el módulo de sesiones no arrastra ninguna consulta
// de reuniones.
import { neon } from "@neondatabase/serverless";

// Fila de la tabla "users" con las columnas en camelCase (ver el SELECT).
export interface AppUser {
  id: number;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
}

// Instancia del cliente SQL (se crea una sola vez).
let sql: ReturnType<typeof neon> | null = null;

// Devuelve (y cachea) el cliente Neon, lanzando si falta la variable de entorno.
function getDb() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("Missing DATABASE_URL environment variable");
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

// Normaliza el email igual que lo hace el índice UNIQUE de la tabla: minúsculas
// y sin espacios alrededor. Sin esto, "Bishopric@Ward.org " no encontraría la
// fila creada como "bishopric@ward.org".
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Busca la cuenta por email (null si no existe). La consulta es parametrizada
// (`${email}`), no interpolada, así que un email con comillas no puede alterar
// el SQL. Sólo devuelve un usuario si viene con hash: un usuario sin hash no
// podría autenticarse nunca y es mejor tratarlo como inexistente.
export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const rows = (await getDb()`
    SELECT
      id,
      email,
      name,
      role,
      password_hash AS "passwordHash"
    FROM users
    WHERE email = ${normalizeEmail(email)}
      AND password_hash <> ''
    LIMIT 1
  `) as unknown as AppUser[];

  return rows[0] ?? null;
}
