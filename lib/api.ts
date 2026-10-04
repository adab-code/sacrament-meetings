// Cliente HTTP para consumir las rutas de API internas de la app.
// Se usa cuando una página (Server Component) necesita el mismo dato que
// expone la API pública, sin duplicar la lógica de consulta.
import { headers } from "next/headers";
import { cache } from "react";
import type { SacramentMeeting } from "./types";

// Construye la URL base del servidor a partir de los headers de la petición
// (necesario para conocer el host/protocolo en cada despliegue).
async function buildApiBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

// GET /api/meetings — listado completo (opcionalmente filtrado por fecha).
export async function fetchMeetings(
  date?: string
): Promise<SacramentMeeting[]> {
  const baseUrl = await buildApiBaseUrl();
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const response = await fetch(`${baseUrl}/api/meetings${query}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `GET /api/meetings failed with status ${response.status}`
    );
  }

  return (await response.json()) as SacramentMeeting[];
}

// GET /api/meetings/[id] — detalle de una reunión (null si no existe).
//
// Envuelto en `cache()` de React (Semana 05) porque desde que la ruta declara
// `generateMetadata`, el mismo detalle se pide DOS veces en la misma petición:
// una para los metadatos y otra para pintar la página. `cache()` memoiza la
// primera respuesta y hace que la segunda salga de memoria.
//
// El ámbito es la petición, no el proceso: entre peticiones distintas se vuelve
// a pedir, así que `cache: "no-store"` sigue mandando y los datos no se
// congelan.
export const fetchMeetingById = cache(
  async (id: number): Promise<SacramentMeeting | null> => {
    const baseUrl = await buildApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/meetings/${id}`, {
      cache: "no-store",
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `GET /api/meetings/${id} failed with status ${response.status}`
      );
    }

    return (await response.json()) as SacramentMeeting;
  }
);