// Imagen de Open Graph del sitio (Semana 05).
//
// Next.js convierte este archivo en una ruta y la adjunta a los metadatos de
// todas las páginas salvo que una ruta declare sus propias imágenes. Al generarla
// con `ImageResponse` en lugar de subir un PNG estático se puede escribir código
// y, si algún día hace falta, variar el contenido por ruta.
//
// Límites de Satori (el motor que dibuja la imagen): sólo flexbox, un
// subconjunto de CSS y estilos EN LÍNEA. Las clases de Tailwind no funcionan
// aquí, así que todo el styling va en objetos de style.
import { ImageResponse } from "next/og";
import { WARD_NAME } from "@/lib/config";

export const alt = `${WARD_NAME} Sacrament Meeting Planner — weekly agendas`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f1b33",
          backgroundImage:
            "linear-gradient(135deg, #0f1b33 0%, #16264a 55%, #2a3550 100%)",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: 24,
              backgroundColor: "#c8a24a",
              color: "#0f1b33",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            {WARD_NAME.charAt(0)}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 28,
            }}
          >
            <div style={{ color: "#ffffff", fontSize: 38, fontWeight: 700 }}>
              {WARD_NAME}
            </div>
            <div
              style={{
                color: "#c8a24a",
                fontSize: 22,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Sacrament Meeting
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 74,
              lineHeight: 1.1,
              fontWeight: 700,
              maxWidth: 940,
            }}
          >
            Weekly agendas for the ward
          </div>
          <div
            style={{
              color: "#cbd5e1",
              fontSize: 30,
              marginTop: 26,
              maxWidth: 900,
            }}
          >
            Hymns, prayers, speakers and ward business — every Sunday.
          </div>
        </div>
      </div>
    ),
    size
  );
}
