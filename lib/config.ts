// Configuración global de la aplicación (nombre de la congregación/ward).
export const WARD_NAME = "Provo 1st Ward";

// Descripción corta del sitio. Se usa como texto por defecto en los metadatos y
// como subtítulo de la imagen de Open Graph.
export const SITE_DESCRIPTION =
  "Weekly sacrament meeting agendas for the Provo 1st Ward: hymns, prayers, speakers, and ward business.";

/**
 * Origen público del sitio, sin barra final.
 *
 * `metadataBase` lo necesita Next.js para convertir las rutas relativas de los
 * metadatos (la imagen de Open Graph, los canonical) en URLs absolutas: sin él,
 * `og:image` saldría como "/opengraph-image-…" y ni Facebook ni Slack podrían
 * descargarla.
 *
 * Se puede sobrescribir con NEXT_PUBLIC_SITE_URL, pero el valor por defecto es
 * el despliegue real para que la app no dependa de que esa variable esté puesta
 * en Vercel. Si algún día se cambia de dominio, hay que actualizar este valor (o
 * definir la variable en el panel de Vercel) para que los enlaces sociales no
 * apunten al despliegue anterior.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sacrament-meetings-team07-7247.vercel.app"
).replace(/\/$/, "");
