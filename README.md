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
- **Autenticación con Auth.js v5** (Semana 05): login por credenciales contra la tabla `users` de Neon, con contraseñas verificadas con bcrypt y sesión en JWT cifrado (`HttpOnly`, `SameSite=Lax`).
- **Rutas protegidas** con `proxy.ts`: `/meetings/new` y `/meetings/[id]/edit` redirigen a `/login` sin sesión; las rutas públicas siguen abiertas.
- **Autorización en dos capas**: el proxy para las páginas y `requireAuth()` en cada Server Action de escritura, porque una Server Action es un endpoint público y el proxy no la cubre.
- **UI según la sesión**: el encabezado muestra *Sign in* o el correo + *Sign out*, y los controles *New meeting*, *Edit* y *Delete* sólo se pintan con sesión iniciada.
- **Metadata por ruta** (Semana 05): título con plantilla, descripción e imagen de Open Graph generada en el sitio; el detalle de cada reunión compone su título y descripción a partir del registro.

## Estructura del proyecto

```
app/
  layout.tsx                  Layout raíz (fuentes, Header/Footer, metadatos)
  page.tsx                    Home con hero e íconos de características
  not-found.tsx               404 raíz
  opengraph-image.tsx         Imagen OG generada con ImageResponse (1200×630)
  robots.ts                   Directivas para rastreadores + puntero al sitemap
  sitemap.ts                  sitemap.xml con una URL por reunión
  globals.css                 Tokens de diseño y estilos globales
  login/page.tsx              Página de inicio de sesión (+ callbackUrl)
  (public)/
    meetings/
      layout.tsx              Navegación interna de la sección de reuniones
      page.tsx                Listado con búsqueda, paginación y enlaces admin
      loading.tsx             Esqueleto de carga durante el fetch de datos
      error.tsx               Boundary de errores de la sección pública
      current/page.tsx        Ruta "This Sunday" (próximo domingo)
      [id]/page.tsx           Detalle de una reunión (+ generateMetadata)
      [id]/not-found.tsx      404 del detalle
  (admin)/
    layout.tsx                Shell de administración (rutas protegidas)
    meetings/
      new/page.tsx            Crear reunión (Server Action createMeeting)
      error.tsx               Boundary de errores de la sección admin
      [id]/edit/page.tsx      Editar reunión (Server Action updateMeeting)
      [id]/edit/not-found.tsx 404 de la edición
  api/
    auth/[...nextauth]/route.ts  Handlers de Auth.js (GET/POST)
    meetings/route.ts         GET /api/meetings (query, page, date)
    meetings/[id]/route.ts    GET /api/meetings/[id]
auth.config.ts                Callbacks de Auth.js compartidos con el proxy
auth.ts                       Provider Credentials, bcrypt, JWT y export de handlers
proxy.ts                      Proxy de Next.js 16: protege /meetings/new y /edit
types/next-auth.d.ts          Amplía Session/User/JWT con el claim `role`
components/
  MeetingForm.tsx             Formulario accesible de alta/edición (useActionState)
  DeleteMeetingButton.tsx     Confirmación en dos pasos + Server Action deleteMeeting
  MeetingCard.tsx             Tarjeta con enlace estirado y controles admin
  MeetingDetail.tsx           Programa completo imprimible
  LoginForm.tsx               Formulario de login (useActionState + useFormStatus)
  SignOutButton.tsx           Server Action de cierre de sesión
  Header.tsx, Footer.tsx, ...  UI reutilizable
lib/
  types.ts                    Modelo de dominio SacramentMeeting
  dates.ts                    Utilidades de fecha y domingos
  meetings-db.ts              Capa de datos Neon (leer + escribir)
  users-db.ts                 Lectura de usuarios para el login
  getMeetingIndex()           Id + fecha de cada reunión, para el sitemap
  actions.ts                  Server Actions, requireAuth() y esquema Zod
  api.ts                      Cliente HTTP hacia las rutas de API
  config.ts                   Nombre del ward, descripción y URL del sitio
scripts/
  001-create-users.sql        Esquema idempotente de la tabla users
  seed-bishopric-user.ts      Crea/actualiza la cuenta bishopric
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
- **Guardas en el servidor.** `createMeeting`, `updateMeeting` y `deleteMeeting`
  llaman a `requireAuth()` antes de validar o escribir. Ocultar los botones no
  protege nada: el endpoint de la Server Action sigue siendo invocable.

## Autenticación y autorización (Semana 05)

Login por **credenciales** con [Auth.js v5](https://authjs.dev) (`next-auth@5.0.0-beta.32`).
No hay adapter: la contraseña se verifica contra la tabla `users` de Neon y la
sesión viaja en un **JWT cifrado** en una cookie, no en una fila de base de datos.

| Pieza                    | Responsabilidad                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `auth.ts`                | Provider `Credentials`: valida con Zod, compara con `bcrypt.compare` y arma el JWT           |
| `auth.config.ts`         | Callbacks compartidos. Al no importar `bcrypt` ni la BD, el proxy no arrastra Node            |
| `proxy.ts`               | Intercepta las rutas admin antes de renderizar                                               |
| `app/api/auth/[...nextauth]/route.ts` | Handlers `GET`/`POST` de Auth.js — el proxy **no** los sustituye                  |
| `lib/users-db.ts`        | `getUserByEmail()`; devuelve el usuario con su hash, nunca el hash al cliente                |
| `lib/actions.ts`         | `authenticate()` y `requireAuth()`                                                           |

Rutas protegidas por el proxy (sin sesión → `307` a `/login?callbackUrl=…`):

| Ruta                    | Con sesión | Sin sesión                     |
| ----------------------- | ---------- | ------------------------------ |
| `/`, `/meetings`, `/meetings/[id]`, `/meetings/current` | 200 | 200 (públicas)      |
| `/login`                | 200        | 200                            |
| `/meetings/new`         | 200        | 307 → `/login`                 |
| `/meetings/[id]/edit`   | 200        | 307 → `/login`                 |
| `GET /api/meetings*`    | 200        | 200 (sólo lectura)             |

Decisiones de seguridad que conviene no deshacer:

- **Fallar cerrado.** El callback `authorized` usa `!!auth?.user`, no un
  `if (auth)` que devolvería `undefined` (falsy) cuando no hay sesión. Un caso
  mal resuelto devuelve `false` y bloquea; `undefined` se confundiría con "sin
  restricción".
- **Fuera del objeto de sesión.** `passwordHash` nunca se devuelve desde
  `authorize()`; sólo `id`, `email`, `name` y `role`, y el rol viaja como claim
  del JWT.
- **`callbackUrl` saneada.** `/login` sólo acepta redirecciones a rutas
  internas que empiezan por `/`; cualquier URL absoluta se descarta. Sin esto,
  `/login?callbackUrl=https://sitio-falso` sería un phishing de redirección.
- **El proxy no protege las Server Actions.** Una Server Action es un endpoint
  público POST; por eso `requireAuth()` se repite dentro de cada acción.
- **Beta de Auth.js.** `5.0.0-beta.32` es la versión que incluye la corrección de
  `GHSA-8fpg-xm3f-6cx3`. Conviene comprobar los avisos de seguridad antes de
  actualizar la dependencia.
- **`proxy.ts`, no `middleware.ts`.** Next.js 16 renombró el archivo; `auth.config.ts`
  existe para que el proxy importe lo mínimo imprescindible.

### Sesión y cookies

La cookie es `authjs.session-token` (`HttpOnly`, `SameSite=Lax`, `Secure` en
producción): no es legible desde JavaScript, así que un XSS no puede robar la
sesión. El JWT está cifrado con AES-256-GCM usando `AUTH_SECRET`.

> **Todos los usuarios son tipo `bishopric`.** No hay registro público (la
> asignación no lo pide) ni roles distintos del rol de edición: el `role` está en
> el esquema para que la autorización por roles sea una extensión, no una
> necesidad actual.

## Metadata (Semana 05)

- **Layout raíz** (`app/layout.tsx`): `title.default` + `title.template`
  (`%s | Provo 1st Ward`), descripción, keywords, `metadataBase` y los valores
  `openGraph`/`twitter` compartidos.
- **`/meetings`**: `title: "Meetings"` y descripción propias del listado.
- **`/meetings/[id]`**: `generateMetadata()` compone el título con el tipo y la
  fecha larga ("Testimony · Sunday, January 4, 2026") y la descripción con
  presidencia, dirección y oradores.
- **`app/opengraph-image.tsx`**: imagen 1200×630 generada con `ImageResponse`
  (Satori). Tailwind no aplica ahí: los estilos van en línea porque el motor sólo
  soporta flexbox y un subconjunto de CSS.
- **`app/robots.ts`**: directivas del Robots Exclusion Standard. Antes de este
  archivo, `/robots.txt` caía en la página 404 y los buscadores recibían HTML con
  estado 404 en lugar de directivas.
- **`app/sitemap.ts`**: `/sitemap.xml` con la home, el listado y **una URL por
  reunión**, que son las páginas que la gente busca de verdad.
- **`metadataBase`** es imprescindible: sin él, `og:image` saldría como
  `/opengraph-image` (relativa) y las redes sociales no podrían descargarla.

`robots.ts` y `sitemap.ts` importan `SITE_URL` de `lib/config.ts` en lugar de
escribir el dominio a mano, para que no haya dos copias que se desincronicen al
cambiar de despliegue.

### Indexación

`next.config.ts` declara `X-Robots-Tag: index, follow` a nivel de aplicación
porque **Vercel inyecta `X-Robots-Tag: noindex` en el edge** de los despliegues
`.vercel.app`; el header de la app tiene prioridad. Sin él, Lighthouse penaliza la
categoría SEO y un rastreador respeta el `noindex` del edge.

Un matiz honesto: esto hace indexable la *respuesta*, pero Vercel sigue
recomendando `noindex` para subdominios `vercel.app` porque no son dominios
propios. Para que el sitio se indexe de verdad hay que añadirle un dominio
propio; el override del header sólo resuelve la auditoría y la señal que recibe el
rastreador.

Dos detalles que suelen sorprender:

1. **Un `title` propio corta la herencia.** Si una página declara su `title`, ya
   no hereda la `description` ni las `openGraph` del layout. Por eso
   `generateMetadata` las repite en lugar de confiar en la herencia.
2. **Las rutas de streaming devuelven 200 en los 404.** Al resolver los
   metadatos, Next.js ya envió las cabeceras, así que un `notFound()` posterior
   llega al cliente con estado 200 (un *soft 404*). Next inyecta
   `<meta name="robots" content="noindex">` automáticamente, de modo que los
   buscadores no indexan esas URLs. Para forzar un 404 real habría que validar el
   id en el proxy, lo que implica una consulta extra en cada visita al detalle;
   no se hizo porque el coste no compensa en esta app.

> Nota sobre `robots.txt` y los 404 de detalle: `robots.txt` pide a los
> rastreadores que.visiten el sitio, pero el detalle de una reunión inexistente
> responde 200 (punto 2). El `noindex` que inyecta Next evita que se indexen, pero
> un sitemap ideal no debería listar URLs así; hoy las que lista son todas
> verificables con un 200.

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

La tabla de usuarios que usa el login (Semana 05) la crea
`scripts/001-create-users.sql`, que es idempotente:

```sql
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,   -- normalizado a minúsculas
  name          TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'bishopric',
  password_hash TEXT        NOT NULL,          -- bcrypt, coste 10
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

El `email` se normaliza a minúsculas y sin espacios antes de buscarlo, para que
el índice `UNIQUE` cubra de verdad "misma persona, distinta capitalización".

## Configuración

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env.local` en la raíz:

   ```bash
   DATABASE_URL="postgresql://..."          # Neon: reuniones + usuarios
   AUTH_SECRET="..."                        # npx auth secret
   AUTH_TRUST_HOST=true                     # permite los headers de Vercel
   # NEXT_PUBLIC_SITE_URL="https://..."     # opcional, ver lib/config.ts
   ```

   > `DATABASE_URL` e `AUTH_SECRET` son obligatorios en producción. El cliente de
   > Neon se crea de forma perezosa en `lib/meetings-db.ts`, así que el proyecto
   > compila sin la primera y sólo falla al consultar en tiempo de ejecución.
   > `AUTH_TRUST_HOST=true` es necesario en Vercel porque Auth.js lee el host de
   > los headers reenviados. `NEXT_PUBLIC_SITE_URL` sólo se usa si se cambia de
   > dominio; por defecto vale el despliegue actual.

3. Crear la tabla de usuarios y la cuenta de prueba:

   ```bash
   npx auth secret                              # genera AUTH_SECRET
   node --env-file=.env.local scripts/seed-bishopric-user.ts
   ```

   El script es idempotente y **no** fija una contraseña por defecto: toma
   `BISHOPRIC_PASSWORD` del entorno y la hashea con bcrypt. Si se omite, genera
   una aleatoria y la imprime una sola vez.

   ```bash
   BISHOPRIC_PASSWORD='mi-clave-segura' node --env-file=.env.local scripts/seed-bishopric-user.ts
   ```

4. Insertar reuniones de ejemplo (ver [esquema](#esquema-de-la-base-de-datos)); por ejemplo, una para el próximo domingo para que funcione *This Sunday*.

## Ejecución

```bash
npm run dev        # servidor de desarrollo (http://localhost:3000)
npm run build      # compilación de producción
npm run start      # sirve el build compilado
npm run lint       # ESLint sobre todo el proyecto
npx tsc --noEmit   # verificación de tipos
```

Para inspeccionar performance con Lighthouse, ejecutar sobre `npm run build && npm run start` (no contra el dev server, cuyos números incluyen artefactos de desarrollo).

## Despliegue

El repositorio está enlazado a Vercel y despliega automáticamente desde `main`.
Antes del primer despliegue con login hace falta **añadir `AUTH_SECRET` en el
panel de Vercel** (Settings → Environment Variables) para *Production* y
*Preview*: si no está, el build compila pero el login falla en tiempo de
ejecución con un error de descifrado de cookie.

## Scripts de datos (referencia)

Para sembrar reuniones desde el dashboard de Neon (SQL Editor) o `psql`:

```sql
INSERT INTO meetings (date, meeting_type, presiding, conducting, opening_hymn)
VALUES ('YYYY-MM-DD', 'regular', 'Bishop John Smith', 'First Counselor',
        '{"number": 200, "title": "Behold the Mountain of the Lord"}');
```