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

// Stubs de escritura — mantienen la firma para la Semana 04, donde se
// conectarán a INSERT/UPDATE/DELETE reales de la base de datos.
export async function addMeeting(
  data: Omit<SacramentMeeting, "id">
): Promise<SacramentMeeting> {
  throw new Error("addMeeting: database implementation coming in Week 04");
}

export async function updateMeeting(
  id: number,
  updates: Partial<Omit<SacramentMeeting, "id">>
): Promise<SacramentMeeting | null> {
  throw new Error("updateMeeting: database implementation coming in Week 04");
}

export async function deleteMeeting(id: number): Promise<boolean> {
  throw new Error("deleteMeeting: database implementation coming in Week 04");
}