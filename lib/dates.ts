// Utilidades de fecha. Trabajan en hora LOCAL (no UTC) y siempre producen
// strings ISO 'YYYY-MM-DD' para comparar con la columna DATE de Postgres.

// Normaliza un Date a las 00:00:00 local para evitar desfases de zona horaria.
function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Convierte un Date a 'YYYY-MM-DD' local (formato que espera la columna date).
export function toISODate(date: Date): string {
  const d = startOfDay(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Devuelve el domingo más reciente (o el propio `from` si es domingo).
export function mostRecentSunday(from: Date = new Date()): Date {
  const d = startOfDay(from);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getSunday(weeksFromNow: number, from: Date = new Date()): Date {
  const d = mostRecentSunday(from);
  d.setDate(d.getDate() + weeksFromNow * 7);
  return d;
}

// Devuelve el PRÓXIMO domingo (hoy mismo si ya es domingo).
// Es lo que consume /meetings/current para el botón "This Sunday".
export function nextSunday(from: Date = new Date()): Date {
  const d = startOfDay(from);
  const diff = d.getDay() === 0 ? 0 : 7 - d.getDay();
  d.setDate(d.getDate() + diff);
  return d;
}