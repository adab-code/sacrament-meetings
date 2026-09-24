# Sacrament Meeting Agendas

Agendas digitales para la **reunión sacramental del Provo 1st Ward** — himnos, oraciones, oradores y asuntos del barrio, con una vista imprimible del programa semanal.

Construido con **Next.js 16** (App Router), **React** y **Tailwind CSS**, con datos persistidos en **Neon PostgreSQL** (`@neondatabase/serverless`).

## Funcionalidades

- **Listado de reuniones** con tarjetas por fecha, tipo y presidencia.
- **Búsqueda** por orador, líder o tipo de reunión, con *debounce* de 300 ms (`use-debounce`).
- **Paginación** de 5 reuniones por página, reflejada en la URL (`?page=`).
- **This Sunday** (`/meetings/current`): resuelve la agenda del próximo domingo y redirige a su detalle; si no existe reúnete, muestra un estado vacío claro.
- **Detalle imprimible** (`/meetings/[id]`) con el programa completo y botón *Print* (CSS dedicado, oculta cabecera/navegación).
- **Rutas de API** públicas: `GET /api/meetings` (con `?query=`, `?page=` y `?date=`) y `GET /api/meetings/[id]`.
- Placeholders de administración (`/meetings/new`, `/meetings/[id]/edit`) reservados para la Semana 04.

## Estructura del proyecto

```
app/
  layout.tsx                  Layout raíz (fuentes, Header/Footer, metadatos)
  page.tsx                    Home con hero e íconos de características
  globals.css                 Tokens de diseño y estilos globales
  (public)/
    meetings/
      layout.tsx              Navegación interna de la sección de reuniones
      page.tsx                Listado con búsqueda y paginación
      loading.tsx             Esqueleto de carga durante el fetch de datos
      current/page.tsx        Ruta "This Sunday" (próximo domingo)
      [id]/page.tsx           Detalle de una reunión (404 si no existe)
  (admin)/
    layout.tsx                Shell de administración (auth en Semana 05)
    meetings/
      new/page.tsx            Placeholder crear reunión (Semana 04)
      [id]/edit/page.tsx      Placeholder editar reunión (Semana 04)
  api/
    meetings/route.ts         GET /api/meetings (query, page, date)
    meetings/[id]/route.ts    GET /api/meetings/[id]
components/                   UI reutilizable (Header, Footer, tarjeta, detalle,
                              buscador, paginación, navegación interna)
lib/
  types.ts                    Modelo de dominio SacramentMeeting
  dates.ts                    Utilidades de fecha y domingos
  meetings-db.ts              Capa de datos Neon (leer + stubs de escritura)
  api.ts                      Cliente HTTP hacia las rutas de API
  config.ts                   Nombre del ward
public/                       Assets estáticos (temple-hero.webp, íconos)
```

## Requisitos previos

- **Node.js 20+** (proyecto creado con Next.js 16).
- Una base **PostgreSQL en Neon** con la tabla `meetings`.

### Esquema de la base de datos

```sql
CREATE TABLE meetings (
  id             SERIAL PRIMARY KEY,
  date           DATE NOT NULL UNIQUE,
  meeting_type   VARCHAR(20) NOT NULL CHECK (
                   meeting_type IN ('testimony','regular','stake','general','special')
                 ),
  presiding      VARCHAR(255) NOT NULL,
  conducting     VARCHAR(255) NOT NULL,
  announcements  TEXT[] DEFAULT '{}',
  opening_hymn   JSONB NOT NULL,      -- { number, title }
  opening_prayer VARCHAR(255) NOT NULL,
  ward_business  JSONB DEFAULT '[]',  -- [{ description }]
  stake_business BOOLEAN DEFAULT false,
  sacrament_hymn JSONB NOT NULL,      -- { number, title }
  speakers       JSONB DEFAULT '[]',  -- [{ name, topic, type }]
  closing_hymn   JSONB NOT NULL,      -- { number, title }
  closing_prayer VARCHAR(255) NOT NULL
);
```

## Configuración

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env.local` en la raíz con la cadena de conexión de Neon:

   ```
   DATABASE_URL="postgresql://..."
   ```

   > El cliente se crea de forma perezosa en `lib/meetings-db.ts`: el proyecto compila sin esta variable y solo falla al consultar en tiempo de ejecución.

3. Insertar reuniones de ejemplo (ver [esquema](#esquema-de-la-base-de-datos)); por ejemplo, una para el próximo domingo para que funcione *This Sunday*.

## Ejecución

```bash
npm run dev        # servidor de desarrollo (http://localhost:3000)
npm run build      # compilación de producción
npm run start      # sirve el build compilado
npm run lint       # ESLint
```

Para inspeccionar performance con Lighthouse, ejecutar sobre `npm run build && npm run start` (no contra el dev server, cuyos números incluyen artefactos de desarrollo).

## Scripts de datos (referencia)

Para sembrar reuniones desde el dashboard de Neon (SQL Editor) o `psql`:

```sql
INSERT INTO meetings (date, meeting_type, presiding, conducting, opening_hymn)
VALUES ('YYYY-MM-DD', 'regular', 'Bishop John Smith', 'First Counselor',
        '{"number": 200, "title": "Behold the Mountain of the Lord"}');
```