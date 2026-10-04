// Layout raíz de la aplicación: carga las fuentes tipográficas vía next/font,
// declara los metadatos globales y envuelve todas las rutas con Header/Footer.
import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { SITE_DESCRIPTION, SITE_URL, WARD_NAME } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

// Metadatos por defecto de todo el sitio (Semana 05).
//
// `default` es el título de las rutas que no declaren el suyo propio, y
// `template` es el molde con el que se envuelven los que sí lo hacen: una página
// con title "Meetings" rinde "Meetings | Provo 1st Ward".
//
// Estos valores NO se heredan cuando una página define su propio `title`: se
// pierde también la descripción y las openGraph de este layout. Por eso
// /meetings/[id] repite la description y las openGraph en su generateMetadata
// en lugar de fiarse de la herencia.
export const metadata: Metadata = {
  title: {
    default: `${WARD_NAME} · Sacrament Meeting Planner`,
    template: `%s | ${WARD_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: `${WARD_NAME} Sacrament Meeting`,
  keywords: [
    "sacrament meeting",
    "meeting agenda",
    "Provo 1st Ward",
    "Latter-day Saint ward",
    "hymns",
    "chalks",
  ],
  // Origen de las URLs absolutas de los metadatos (ver lib/config.ts).
  metadataBase: new URL(SITE_URL),
  // La imagen la genera app/opengraph-image.tsx; al declararla aquí sin
  // `images`, Next.js la adjunta automáticamente a cada ruta.
  openGraph: {
    type: "website",
    siteName: `${WARD_NAME} Sacrament Meeting`,
    locale: "en_US",
    url: SITE_URL,
  },
  // X no necesita tarjeta propia: si no hay twitter:*, cae en los openGraph:*
  // de arriba. Se declara igualmente para fijar summary_large_image y no
  // depender del comportamiento por defecto de cada plataforma.
  twitter: {
    card: "summary_large_image",
    title: `${WARD_NAME} · Sacrament Meeting Planner`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
