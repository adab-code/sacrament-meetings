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
- **CRUD con Server Actions** (Semana 04): crear, editar y borrar reuniones contra Neon con SQL real, sin endpoints de escritura públicos.
- **Validación Zod** compartida por las tres acciones, con los mismos mensajes de error en el cliente y en el servidor.
- **Formularios accesibles**: `useActionState`, `aria-invalid`, `aria-describedby` y regiones `aria-live` con los errores de campo.
- **Errores recuperables**: `error.tsx` por sección y páginas `not-found.tsx` propias para el detalle y la edición.
- **Fecha duplicada** detectada desde Postgres (`23505`) y mostrada como error de campo en vez de un error 500.
- `revalidatePath` tras cada mutación para que el listado, el detalle y la edición muestren siempre datos frescos.

## Estructura del proyecto

```
app/
  layout.tsx                  Layout raíz (fuentes, Header/Footer, metadatos)
  page.tsx                    Home con hero e íconos de características
  not-found.tsx               404 raíz
  globals.css                 Tokens de diseño y estilos globales
  (public)/
    meetings/
      layout.tsx              Navegación interna de la sección de reuniones
      page.tsx                Listado con búsqueda, paginación y enlaces admin
      loading.tsx             Esqueleto de carga durante el fetch de datos
      error.tsx               Boundary de errores de la sección pública
      current/page.tsx        Ruta "This Sunday" (próximo domingo)
      [id]/page.tsx           Detalle de una reunión
      [id]/not-found.tsx      404 del detalle
  (admin)/
    layout.tsx                Shell de administración (auth en Semana 05)
    meetings/
      new/page.tsx            Crear reunión (Server Action createMeeting)
      error.tsx               Boundary de errores de la sección admin
      [id]/edit/page.tsx      Editar reunión (Server Action updateMeeting)
      [id]/edit/not-found.tsx 404 de la edición
  api/
    meetings/route.ts         GET /api/meetings (query, page, date)
    meetings/[id]/route.ts    GET /api/meetings/[id]
components/
  MeetingForm.tsx             Formulario accesible de alta/edición (useActionState)
  DeleteMeetingButton.tsx     Confirmación en dos pasos + Server Action deleteMeeting
  MeetingCard.tsx             Tarjeta con enlace estirado y controles admin
  MeetingDetail.tsx           Programa completo imprimible
  Header.tsx, Footer.tsx, ...  UI reutilizable
lib/
  types.ts                    Modelo de dominio SacramentMeeting
  dates.ts                    Utilidades de fecha y domingos
  meetings-db.ts              Capa de datos Neon (leer + escribir)
  actions.ts                  Server Actions + esquema Zod de validación
  api.ts                      Cliente HTTP hacia las rutas de API
  config.ts                   Nombre del ward
public/                       Assets estáticos (temple-hero.webp, íconos)
```

## Arquitectura de las escrituras

Las tres operaciones de escritura viven en Server Actions (`lib/actions.ts`) y nunca
exponen una ruta HTTP de escritura:

| Acción           | Ubicación                              | Efecto                                        |
| ---------------- | -------------------------------------- | --------------------------------------------- |
| `createMeeting`  | `/meetings/new`                        | `INSERT` + `revalidatePath` + redirect a detalle |
| `updateMeeting`  | `/meetings/[id]/edit`                  | `UPDATE` con lista blanca de columnas + redirect a detalle |
| `deleteMeeting`  | Botón en `/meetings`                   | `DELETE` + `revalidatePath` + redirect al listado |

Detalles de implementación relevantes:

- **Una sola validación.** `MeetingFormSchema` (Zod) convierte el `FormData` en el
  objeto de dominio; los tres mensajes (`required`, fechas inválidas, listas
  `Nombre | Tema`) son idénticos en el servidor y en el cliente.
- **Columnas seguras.** `updateMeeting` sólo interpola nombres de columna de la
  lista blanca `UPDATABLE_COLUMNS`; los valores siempre viajan como parámetros.
- **JSONB explícito.** Las columnas `jsonb` se serializan con `JSON.stringify`
  antes de enviarse. Es necesario: el driver de Neon convierte *cualquier* array
  de JavaScript en un literal de array de Postgres, lo que es inválido para un
  `jsonb` que guarda una lista de objetos. Las columnas `TEXT[]` (`announcements`)
  sí reciben el array directamente.
- **Errores.** Un `23505` de la restricción única de `date` se traduce a
  *"A meeting already exists on that date."* en el campo `date`. Cualquier otro
  fallo se registra en el servidor y se relanza para que lo atrape `error.tsx`.
- **`notFound()`** para ids inexistentes o no numéricos en el detalle y la edición.
- **Progressive enhancement.** Los formularios funcionan sin JavaScript; React
  hidrata `useActionState`/`useFormStatus` para deshabilitar el envío y mostrar
  el estado pendiente.

> La autenticación y la autorización de las rutas `/admin` llegan en la Semana 05.
> Durante la Semana 04 cualquiera con la URL puede escribir.

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
npm run lint       # ESLint sobre todo el proyecto
npx tsc --noEmit   # verificación de tipos
```

Para inspeccionar performance con Lighthouse, ejecutar sobre `npm run build && npm run start` (no contra el dev server, cuyos números incluyen artefactos de desarrollo).

## Scripts de datos (referencia)

Para sembrar reuniones desde el dashboard de Neon (SQL Editor) o `psql`:

```sql
INSERT INTO meetings (date, meeting_type, presiding, conducting, opening_hymn)
VALUES ('YYYY-MM-DD', 'regular', 'Bishop John Smith', 'First Counselor',
        '{"number": 200, "title": "Behold the Mountain of the Lord"}');
```