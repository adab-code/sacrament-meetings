import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Vercel inyecta `X-Robots-Tag: noindex` en el edge de los despliegues de
  // este proyecto, y eso hace que Lighthouse penalice la categoría SEO aunque
  // el HTML sea correcto. Un header de la app tiene prioridad sobre el del
  // edge, así que aquí se declara explícitamente que la app sí es indexable.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "index, follow" }],
      },
    ];
  },
};

export default nextConfig;
