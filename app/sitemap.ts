// sitemap.xml (Semana 05). Declara al rastreador qué rutas existen y cuáles
// cambian, para que no tenga que descubrir el sitio siguiendo enlaces.
//
// Se incluye cada detalle de reunión porque son las páginas que la gente busca
// de verdad (buscan por orador o por fecha); una agenda estática sin sus
// reuniones sería un sitemap inútil.
import type { MetadataRoute } from "next";
import { getMeetingIndex } from "@/lib/meetings-db";
import { SITE_URL } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Si la base de datos no responde se devuelve igualmente el sitemap con las
  // rutas estáticas: un sitemap con dos URLs es mucho mejor que un 500, y el
  // error real queda registrado en los logs del servidor.
  const meetings = await getMeetingIndex().catch(() => []);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/meetings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...meetings.map((meeting) => ({
      url: `${SITE_URL}/meetings/${meeting.id}`,
      // `date` es la fecha de la reunión, no su fecha de modificación: una
      // agenda pasada no cambia, así que `lastModified` debe reflejar eso.
      lastModified: new Date(meeting.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}