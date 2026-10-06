// Capa de acceso a datos contra Neon PostgreSQL.
// El cliente se crea de forma perezosa (getDb) para poder compilar sin
// DATABASE_URL en el entorno y solo exigirla en tiempo de ejecución.
import { neon } from "@neondatabase/serverless";
import type { SacramentMeeting } from "./types";

// Número de reuniones por página del listado.
const ITEMS_PER_PAGE = 5;

// Instancia del cliente SQL (se crea una sola vez).
let sql: ReturnType<typeof neon> | null = null;

// Devuelve (y cachea) el cliente Neon, lanzando si falta la variable de entorno.
function getDb() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("Missing DATABASE_URL environment variable");
    }
    sql = neon(process.env.DATABASE_URL!);
  }
  return sql;
}

// Página actual de reuniones según filtro de búsqueda, ordenadas por fecha
// descendente y paginadas con LIMIT/OFFSET. Los IDs y nombres se normalizan
// (camelCase) con alias en el SELECT para encajar en SacramentMeeting.
export async function getMeetings(
  query: string = "",
  currentPage: number = 1
): Promise<SacramentMeeting[]> {
  const searchTerm = `%${query}%`;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const rows = (await getDb()`
    SELECT
      id,
      to_char(date, 'YYYY-MM-DD') AS "date",
      meeting_type                AS "meetingType",
      presiding, conducting, announcements,
      opening_hymn                AS "openingHymn",
      opening_prayer              AS "openingPrayer",
      ward_business               AS "wardBusiness",
      stake_business              AS "stakeBusiness",
      sacrament_hymn              AS "sacramentHymn",
      speakers,
      closing_hymn                AS "closingHymn",
      closing_prayer              AS "closingPrayer"
    FROM meetings
    WHERE
      presiding     ILIKE ${searchTerm}
      OR conducting ILIKE ${searchTerm}
      OR meeting_type ILIKE ${searchTerm}
      OR speakers::text ILIKE ${searchTerm}
    ORDER BY date DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
  `) as unknown as SacramentMeeting[];
  return rows;
}

// Total de páginas del listado para el mismo filtro de búsqueda (paginación).
export async function getMeetingsTotalPages(
  query: string = ""
): Promise<number> {
  const searchTerm = `%${query}%`;
  const rows = (await getDb()`
    SELECT COUNT(*) AS "count" FROM meetings
    WHERE
      presiding     ILIKE ${searchTerm}
      OR conducting ILIKE ${searchTerm}
      OR meeting_type ILIKE ${searchTerm}
      OR speakers::text ILIKE ${searchTerm}
  `) as unknown as Array<{ count: string | number }>;
  return Math.ceil(Number(rows[0].count) / ITEMS_PER_PAGE);
}

// Listado ligero de id + fecha, sin paginar, para el sitemap (Semana 05).
//
// Existe una función propia en vez de reutilizar `getMeetings("", 0)` por dos
// motivos concretos: `getMeetings` siempre calcula un OFFSET a partir de la
// página, así que pedir la página 0 daría `offset = -ITEMS_PER_PAGE`, y un
// OFFSET negativo es un error en Postgres; además el sitemap sólo necesita
// `id` y `date`, mientras que `getMeetings` arrastra todas las columnas `jsonb`
// (himnos, oradores, asuntos) que ahí se descartan.
export async function getMeetingIndex(): Promise<
  Array<{ id: number; date: string }>
> {
  const rows = (await getDb()`
    SELECT id, to_char(date, 'YYYY-MM-DD') AS "date"
    FROM meetings
    ORDER BY date DESC
  `) as unknown as Array<{ id: number; date: string }>;
  return rows;
}

// Busca la reunión de una fecha concreta ('YYYY-MM-DD'). Usado por
// /meetings/current para resolver la agenda del próximo domingo.
export async function getMeetingByDate(
  date: string
): Promise<SacramentMeeting | null> {
  const rows = (await getDb()`
    SELECT
      id,
      to_char(date, 'YYYY-MM-DD') AS "date",
      meeting_type                AS "meetingType",
      presiding, conducting, announcements,
      opening_hymn                AS "openingHymn",
      opening_prayer              AS "openingPrayer",
      ward_business               AS "wardBusiness",
      stake_business              AS "stakeBusiness",
      sacrament_hymn              AS "sacramentHymn",
      speakers,
      closing_hymn                AS "closingHymn",
      closing_prayer              AS "closingPrayer"
    FROM meetings WHERE date = ${date} LIMIT 1
  `) as unknown as SacramentMeeting[];
  return rows[0] ?? null;
}

// Devuelve una reunión por su id (null si no existe). Usado por el detalle.
export async function getMeetingById(
  id: number
): Promise<SacramentMeeting | null> {
  const rows = (await getDb()`
    SELECT
      id,
      to_char(date, 'YYYY-MM-DD') AS "date",
      meeting_type                AS "meetingType",
      presiding, conducting, announcements,
      opening_hymn                AS "openingHymn",
      opening_prayer              AS "openingPrayer",
      ward_business               AS "wardBusiness",
      stake_business              AS "stakeBusiness",
      sacrament_hymn              AS "sacramentHymn",
      speakers,
      closing_hymn                AS "closingHymn",
      closing_prayer              AS "closingPrayer"
    FROM meetings WHERE id = ${id}
  `) as unknown as SacramentMeeting[];
  return rows[0] ?? null;
}

// Lista blanca de columnas actualizables: impide interpolar en el SQL nombres
// de columna que vengan de la entrada del usuario. El orden de las entradas es
// irrelevante porque el UPDATE se arma dinámicamente.
const UPDATABLE_COLUMNS = {
  date: "date",
  meetingType: "meeting_type",
  presiding: "presiding",
  conducting: "conducting",
  announcements: "announcements",
  openingHymn: "opening_hymn",
  openingPrayer: "opening_prayer",
  wardBusiness: "ward_business",
  stakeBusiness: "stake_business",
  sacramentHymn: "sacrament_hymn",
  speakers: "speakers",
  closingHymn: "closing_hymn",
  closingPrayer: "closing_prayer",
} as const satisfies Record<keyof Omit<SacramentMeeting, "id">, string>;

// Proyección compartida por las consultas de escritura (alias a camelCase).
const RETURNING_COLUMNS = `
  id,
  to_char(date, 'YYYY-MM-DD') AS "date",
  meeting_type                AS "meetingType",
  presiding, conducting, announcements,
  opening_hymn                AS "openingHymn",
  opening_prayer              AS "openingPrayer",
  ward_business               AS "wardBusiness",
  stake_business              AS "stakeBusiness",
  sacrament_hymn              AS "sacramentHymn",
  speakers,
  closing_hymn                AS "closingHymn",
  closing_prayer              AS "closingPrayer"
`;

// Columnas jsonb: sus valores se serializan a JSON antes de enviarlos.
const JSONB_COLUMNS = new Set<string>([
  "opening_hymn",
  "ward_business",
  "sacrament_hymn",
  "speakers",
  "closing_hymn",
]);

// Los valores que van a columnas jsonb se serializan aquí, no se dejan en
// manos del driver: @neondatabase/serverless convierte CUALQUIER array de
// JavaScript en un literal de array de Postgres ('{"a","b"}'), y eso es
// inválido para un jsonb que contiene una lista de objetos. Las columnas
// TEXT[] (announcements) sí reciben el array directamente.
function toJsonb(value: unknown): string {
  return JSON.stringify(value);
}

// Inserta una reunión nueva y devuelve el registro completo (con su id).
export async function addMeeting(
  data: Omit<SacramentMeeting, "id">
): Promise<SacramentMeeting> {
  const rows = (await getDb().query(
    `INSERT INTO meetings (
       date, meeting_type, presiding, conducting, announcements,
       opening_hymn, opening_prayer, ward_business, stake_business,
       sacrament_hymn, speakers, closing_hymn, closing_prayer
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING ${RETURNING_COLUMNS}`,
    [
      data.date,
      data.meetingType,
      data.presiding,
      data.conducting,
      data.announcements ?? [],
      toJsonb(data.openingHymn),
      data.openingPrayer,
      toJsonb(data.wardBusiness),
      data.stakeBusiness ?? false,
      toJsonb(data.sacramentHymn),
      toJsonb(data.speakers),
      toJsonb(data.closingHymn),
      data.closingPrayer,
    ]
  )) as unknown as SacramentMeeting[];

  const created = rows[0];
  if (!created) {
    throw new Error("addMeeting: INSERT ... RETURNING no devolvió ninguna fila");
  }
  return created;
}

// Actualiza sólo los campos presentes en `updates` y devuelve la reunión
// resultante, o null si el id no existe. Si `updates` viene vacío se limita a
// leer el registro (mismo contrato que getMeetingById).
export async function updateMeeting(
  id: number,
  updates: Partial<Omit<SacramentMeeting, "id">>
): Promise<SacramentMeeting | null> {
  const assignments: string[] = [];
  const params: unknown[] = [];

  for (const field of Object.keys(
    UPDATABLE_COLUMNS
  ) as (keyof typeof UPDATABLE_COLUMNS)[]) {
    const value = updates[field];
    if (value === undefined) {
      continue;
    }
    const column = UPDATABLE_COLUMNS[field];
    params.push(JSONB_COLUMNS.has(column) ? toJsonb(value) : value);
    assignments.push(`${column} = $${params.length}`);
  }

  if (assignments.length === 0) {
    return getMeetingById(id);
  }

  params.push(id);
  const rows = (await getDb().query(
    `UPDATE meetings
     SET ${assignments.join(", ")}
     WHERE id = $${params.length}
     RETURNING ${RETURNING_COLUMNS}`,
    params
  )) as unknown as SacramentMeeting[];

  return rows[0] ?? null;
}

// Borra una reunión. Devuelve false si el id no existía (y no lanza).
export async function deleteMeeting(id: number): Promise<boolean> {
  const rows = (await getDb().query(
    "DELETE FROM meetings WHERE id = $1 RETURNING id",
    [id]
  )) as unknown as Array<{ id: number }>;
  return rows.length > 0;
}