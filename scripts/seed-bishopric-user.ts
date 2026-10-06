// Crea la tabla "users" y da de alta la cuenta del bishopric (Semana 05).
//
// Es idempotente: se puede volver a ejecutar las veces que haga falta. Si la
// cuenta ya existe le actualiza el nombre, el rol y el hash, lo que también
// sirve para rotar la contraseña.
//
// Uso (desde la raíz del proyecto):
//
//   BISHOPRIC_EMAIL=... BISHOPRIC_PASSWORD=... \
//     node --env-file=.env.local scripts/seed-bishopric-user.ts
//
// Si no se pasa BISHOPRIC_PASSWORD se genera una contraseña aleatoria y se
// imprime por pantalla (sólo se puede ver aquí: nunca se guarda en claro).
//
// El script es autónomo a propósito (no importa de `lib/`) para poder ejecutarse
// con el stripping de tipos nativo de Node, que no resuelve los alias `@/` de
// tsconfig ni las extensiones implícitas de un módulo del proyecto.
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

// Coste de bcrypt. 10 es el valor por defecto de bcrypt y el equilibrio habitual
// entre seguridad y latencia; en un login con bcryptjs (JS puro, sin binding
// nativo) subirlo a 12 se nota de forma perceptible en el tiempo de respuesta.
const BCRYPT_ROUNDS = 10;

const DEFAULT_EMAIL = "bishopric@provo1stward.org";
const DEFAULT_NAME = "Provo 1st Ward Bishopric";
const DEFAULT_ROLE = "bishopric";

const here = dirname(fileURLToPath(import.meta.url));

// Parte un archivo .sql en sentencias individuales.
//
// Hace falta porque `sql.query()` de Neon envía un prepared statement, y
// Postgres responde "cannot insert multiple commands into a prepared statement"
// (42601) en cuanto la cadena lleva más de un comando. No se puede simply
// hacer `ddl.split(";")`: un `;` dentro de una cadena o de un comentario
// partiría la sentencia por la mitad.
//
// Cubre lo que aparece en el DDL de este proyecto y en un archivo .sql normal:
// comentarios de línea (`--`) y de bloque (`/* *​/`, anidados), cadenas con
// comillas simples (con `''` escapado), identificadores con comillas dobles y
// cadenas con dollar-quoting (`$tag$...$tag$`, que usa Postgres en funciones).
function splitSqlStatements(source: string): string[] {
  const statements: string[] = [];
  let current = "";
  let index = 0;

  // Etiqueda del dollar-quoting abierta ($ o $tag$), o null si no hay ninguna.
  let dollarTag: string | null = null;
  let blockDepth = 0;

  const push = () => {
    const statement = current.trim();
    if (statement) statements.push(statement);
    current = "";
  };

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (dollarTag !== null) {
      // Dentro de una cadena dollar-quoted sólo importa cerrar con la etiqueta.
      if (source.startsWith(dollarTag, index)) {
        current += dollarTag;
        index += dollarTag.length;
        dollarTag = null;
        continue;
      }
      current += char;
      index += 1;
      continue;
    }

    if (char === "-" && next === "-") {
      const newline = source.indexOf("\n", index);
      const end = newline === -1 ? source.length : newline;
      current += source.slice(index, end);
      index = end;
      continue;
    }

    if (char === "/" && next === "*") {
      blockDepth += 1;
      current += "/*";
      index += 2;
      continue;
    }

    if (char === "*" && next === "/" && blockDepth > 0) {
      blockDepth -= 1;
      current += "*/";
      index += 2;
      continue;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      current += char;
      index += 1;
      while (index < source.length) {
        const inner = source[index];
        current += inner;
        if (inner === quote) {
          // '' dentro de una cadena es un escape, no el cierre.
          if (source[index + 1] === quote) {
            current += quote;
            index += 2;
            continue;
          }
          index += 1;
          break;
        }
        index += 1;
      }
      continue;
    }

    // $tag$ abre una cadena dollar-quoted. $ solo no cuenta (es un placeholder).
    if (char === "$") {
      const match = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(source.slice(index));
      if (match) {
        dollarTag = match[0];
        current += dollarTag;
        index += dollarTag.length;
        continue;
      }
    }

    if (char === ";") {
      push();
      index += 1;
      continue;
    }

    current += char;
    index += 1;
  }

  push();

  if (dollarTag !== null || blockDepth > 0) {
    throw new Error("Unterminated dollar-quoted string or block comment in SQL.");
  }

  return statements;
}

// Contraseña aleatoria legible: mezcla mayúsculas, minúsculas y dígitos para no
// depender de reglas de complejidad externas. 20 caracteres de alphabet sin
// caracteres ambiguos (0/O, 1/l/I).
function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(20);
  let password = "";
  for (const byte of bytes) {
    password += alphabet[byte % alphabet.length];
  }
  return password;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "Missing DATABASE_URL environment variable (¿falta --env-file=.env.local?)"
    );
  }

  const email = (process.env.BISHOPRIC_EMAIL ?? DEFAULT_EMAIL)
    .trim()
    .toLowerCase();
  const name = process.env.BISHOPRIC_NAME ?? DEFAULT_NAME;
  const role = process.env.BISHOPRIC_ROLE ?? DEFAULT_ROLE;
  const generated = !process.env.BISHOPRIC_PASSWORD;
  const password = process.env.BISHOPRIC_PASSWORD ?? generatePassword();

  if (password.length < 8) {
    throw new Error("BISHOPRIC_PASSWORD must be at least 8 characters.");
  }

  const sql = neon(databaseUrl);

  // 1. Esquema. El DDL vive en un .sql aparte para que quede versionado y se
  //    pueda aplicar a mano (psql) sin pasar por este script.
  const ddl = readFileSync(join(here, "001-create-users.sql"), "utf8");
  const statements = splitSqlStatements(ddl);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`✓ Table \`users\` is ready (${statements.length} statements).`);

  // 2. Alta (o refresco) de la cuenta con la contraseña hasheada.
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const rows = (await sql.query(
    `INSERT INTO users (email, name, role, password_hash)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
       SET name          = EXCLUDED.name,
           role          = EXCLUDED.role,
           password_hash = EXCLUDED.password_hash
     RETURNING id, email, name, role`,
    [email, name, role, passwordHash]
  )) as unknown as Array<{ id: number; email: string; name: string; role: string }>;

  const user = rows[0];
  if (!user) {
    throw new Error("The upsert did not return a row.");
  }

  console.log(`✓ Bishopric account ready: #${user.id} ${user.email} (${user.role})`);
  if (generated) {
    console.log("");
    console.log("  Generated password (shown once, never stored in clear):");
    console.log(`  ${password}`);
    console.log("");
    console.log("  Guárdala en el gestor de contraseñas del equipo.");
  }
}

await main();
