// robots.txt (Semana 05). Antes de este archivo, /robots.txt caía en la página
// 404 de Next.js: los buscadores recibían HTML con estado 404 en vez de las
// directivas del estándar.
//
// Se genera con código en lugar de un `robots.txt` estático por una razón
// práctica: la URL del sitio vive en SITE_URL (lib/config.ts), que también usa
// `metadataBase`. Un archivo de texto obligaría a copiar el dominio a mano en
// dos sitios y los dos se desincronizarían en cuanto cambiara el despliegue.
//
// `disallow` cubre las rutas que no tienen sentido en un índice: las de
// escritura, que además ya requieren sesión, y las páginas de error.
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/meetings/new", "/meetings/*/edit", "/login", "/api/"],
      },
    ],
    // La URL del sitemap se declara aquí para que un rastreador la descubra sin
    // tener que adivinar /sitemap.xml.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}