-- Semana 05 · Autenticación (Auth.js v5 Credentials)
--
-- Tabla de cuentas de la aplicación. En este proyecto sólo hay un tipo de
-- usuario: el bishopric que administra el calendario de reuniones. Aun así se
-- guardan email, nombre y rol para que la sesión incluya datos útiles y para
-- que SUM 06 pueda extender el modelo a varios usuarios sin migrar.
--
-- El hash de la contraseña NUNCA se almacena en claro: `password_hash` guarda
-- el resultado de bcrypt con sal y coste, y la comparación se hace en
-- `lib/users-db.ts` / `auth.ts` con bcrypt.compare.
--
-- El script que crea esta tabla y da de alta la cuenta inicial es
-- `scripts/seed-bishopric-user.ts` (idempotente: se puede volver a ejecutar).

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  -- Se normaliza siempre a minúsculas y sin espacios (ver getUserByEmail), así
  -- que el índice UNIQUE cubre de verdad "misma persona, distinta capitalización".
  email         TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'bishopric',
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  users               IS 'Cuentas con acceso a la sección (admin) del planner.';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt de la contraseña; nunca texto plano.';
COMMENT ON COLUMN users.role          IS 'Permiso de la cuenta: bishopric administers el calendario.';
