// Formulario de reunión (crear y editar), compartido por ambas rutas.
//
// Es un Client Component porque usa useActionState: el Server Action devuelve
// el estado de validación y el formulario lo pinta sin recargar la página.
//
// Accesibilidad:
//   - Cada control tiene <label htmlFor> con un id coincidente.
//   - aria-describedby apunta al texto de ayuda y al contenedor de errores.
//   - Los contenedores de error son regiones aria-live="polite" para que un
//     lector de pantalla anuncie los mensajes en cuanto llegan del servidor.
//   - aria-invalid marca el campo cuando hay error, y el borde cambia de color.
"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import type { MeetingField, MeetingFormState } from "@/lib/actions";
import { MEETING_TYPE_LABELS } from "@/lib/types";
import type { MeetingType, SacramentMeeting } from "@/lib/types";

interface MeetingFormProps {
  // Acción ya enlazada: createMeeting, o updateMeeting.bind(null, id).
  action: (
    state: MeetingFormState,
    formData: FormData
  ) => Promise<MeetingFormState>;
  meeting?: SacramentMeeting;
  submitLabel: string;
}

const MEETING_TYPES = Object.keys(MEETING_TYPE_LABELS) as MeetingType[];

const INITIAL_STATE: MeetingFormState = { errors: {}, message: null };

// ---------------------------------------------------------------------------
// Estilos compartidos
// ---------------------------------------------------------------------------

const CONTROL_BASE =
  "block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy-900 shadow-sm outline-none transition focus:ring-2";
const CONTROL_OK =
  "border-cream-300 focus:border-gold-500/70 focus:ring-gold-400/40";
const CONTROL_ERROR =
  "border-red-500 focus:border-red-500 focus:ring-red-300/40";
const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-navy-900";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-ink-700";
const ERROR_CLASS = "mt-1.5 text-sm font-medium text-red-700";

function controlClasses(hasError: boolean): string {
  return `${CONTROL_BASE} ${hasError ? CONTROL_ERROR : CONTROL_OK}`;
}

// Ids que un lector de pantalla leerá tras el campo: la ayuda (si existe) y el
// contenedor de errores.
function describedBy(name: MeetingField, hasHint: boolean): string {
  return hasHint ? `${name}-hint ${name}-error` : `${name}-error`;
}

// ---------------------------------------------------------------------------
// Controles reutilizables
// ---------------------------------------------------------------------------

// Región viva que anuncia los mensajes de validación de un campo.
function FieldErrors({ id, errors }: { id: string; errors?: string[] }) {
  return (
    <div id={id} aria-live="polite" aria-atomic="true">
      {errors?.map((error) => (
        <p key={error} className={ERROR_CLASS}>
          {error}
        </p>
      ))}
    </div>
  );
}

interface BaseFieldProps {
  name: MeetingField;
  label: string;
  errors?: string[];
  hint?: string;
}

interface TextFieldProps extends BaseFieldProps {
  defaultValue?: string;
  type?: "text" | "number" | "date";
  min?: number;
  max?: number;
}

function TextField({
  name,
  label,
  errors,
  hint,
  defaultValue = "",
  type = "text",
  min,
  max,
}: TextFieldProps) {
  const hasError = Boolean(errors?.length);

  return (
    <div>
      <label htmlFor={name} className={LABEL_CLASS}>
        {label}
        <span aria-hidden="true"> *</span>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        min={min}
        max={max}
        defaultValue={defaultValue}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(name, Boolean(hint))}
        className={controlClasses(hasError)}
      />
      {hint ? (
        <p id={`${name}-hint`} className={HINT_CLASS}>
          {hint}
        </p>
      ) : null}
      <FieldErrors id={`${name}-error`} errors={errors} />
    </div>
  );
}

function TextAreaField({
  name,
  label,
  errors,
  hint,
  defaultValue = "",
  rows = 3,
}: BaseFieldProps & { defaultValue?: string; rows?: number }) {
  const hasError = Boolean(errors?.length);

  return (
    <div>
      <label htmlFor={name} className={LABEL_CLASS}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(name, Boolean(hint))}
        className={`${controlClasses(hasError)} resize-y leading-6`}
      />
      {hint ? (
        <p id={`${name}-hint`} className={HINT_CLASS}>
          {hint}
        </p>
      ) : null}
      <FieldErrors id={`${name}-error`} errors={errors} />
    </div>
  );
}

function SelectField({
  name,
  label,
  errors,
  defaultValue,
  options,
}: BaseFieldProps & { defaultValue?: string; options: readonly MeetingType[] }) {
  const hasError = Boolean(errors?.length);

  return (
    <div>
      <label htmlFor={name} className={LABEL_CLASS}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={hasError || undefined}
        aria-describedby={`${name}-error`}
        className={controlClasses(hasError)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {MEETING_TYPE_LABELS[option]}
          </option>
        ))}
      </select>
      <FieldErrors id={`${name}-error`} errors={errors} />
    </div>
  );
}

function CheckboxField({
  name,
  label,
  errors,
  defaultChecked = false,
}: BaseFieldProps & { defaultChecked?: boolean }) {
  const hasError = Boolean(errors?.length);

  return (
    <div>
      <div className="flex items-center gap-3">
        <input
          id={name}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          aria-invalid={hasError || undefined}
          aria-describedby={`${name}-error`}
          className="h-5 w-5 shrink-0 rounded border-cream-300 accent-navy-900 focus:ring-2 focus:ring-gold-400/50"
        />
        <label htmlFor={name} className="text-sm font-medium text-navy-900">
          {label}
        </label>
      </div>
      <FieldErrors id={`${name}-error`} errors={errors} />
    </div>
  );
}

function Fieldset({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
      <legend className="px-2 font-display text-lg font-semibold tracking-tight text-navy-900">
        {title}
      </legend>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

// Bloque de una fila del programa: himno (número + título) y, opcionalmente,
// la oración que sigue a ese himno.
function ProgramRow({
  numberName,
  numberLabel,
  numberDefault,
  numberErrors,
  titleName,
  titleLabel,
  titleDefault,
  titleErrors,
  prayer,
}: {
  numberName: MeetingField;
  numberLabel: string;
  numberDefault: string;
  numberErrors?: string[];
  titleName: MeetingField;
  titleLabel: string;
  titleDefault: string;
  titleErrors?: string[];
  prayer?: {
    name: MeetingField;
    label: string;
    defaultValue: string;
    errors?: string[];
  };
}) {
  return (
    <div className="sm:col-span-2 space-y-5">
      <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
        <TextField
          name={numberName}
          label={numberLabel}
          type="number"
          min={1}
          max={1000}
          errors={numberErrors}
          defaultValue={numberDefault}
        />
        <TextField
          name={titleName}
          label={titleLabel}
          errors={titleErrors}
          defaultValue={titleDefault}
        />
      </div>
      {prayer ? (
        <TextField
          name={prayer.name}
          label={prayer.label}
          errors={prayer.errors}
          defaultValue={prayer.defaultValue}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Valores iniciales
// ---------------------------------------------------------------------------

interface FormDefaults {
  date: string;
  meetingType: MeetingType;
  presiding: string;
  conducting: string;
  openingHymnNumber: string;
  openingHymnTitle: string;
  openingPrayer: string;
  sacramentHymnNumber: string;
  sacramentHymnTitle: string;
  closingHymnNumber: string;
  closingHymnTitle: string;
  closingPrayer: string;
  wardBusiness: string;
  stakeBusiness: boolean;
  speakers: string;
  musicalNumbers: string;
  announcements: string;
}

// Serializa una reunión existente al formato de los textareas (una línea por
// elemento). Sin reunión, devuelve los valores por defecto del alta.
function buildDefaults(meeting?: SacramentMeeting): FormDefaults {
  const speakers = meeting?.speakers ?? [];
  return {
    date: meeting?.date ?? "",
    meetingType: meeting?.meetingType ?? "regular",
    presiding: meeting?.presiding ?? "",
    conducting: meeting?.conducting ?? "",
    openingHymnNumber: meeting ? String(meeting.openingHymn.number) : "",
    openingHymnTitle: meeting?.openingHymn.title ?? "",
    openingPrayer: meeting?.openingPrayer ?? "",
    sacramentHymnNumber: meeting ? String(meeting.sacramentHymn.number) : "",
    sacramentHymnTitle: meeting?.sacramentHymn.title ?? "",
    closingHymnNumber: meeting ? String(meeting.closingHymn.number) : "",
    closingHymnTitle: meeting?.closingHymn.title ?? "",
    closingPrayer: meeting?.closingPrayer ?? "",
    wardBusiness: (meeting?.wardBusiness ?? [])
      .map((item) => item.description)
      .join("\n"),
    stakeBusiness: meeting?.stakeBusiness ?? false,
    speakers: speakers
      .filter((item) => item.type === "speaker")
      .map((item) => `${item.name} | ${item.topic}`)
      .join("\n"),
    musicalNumbers: speakers
      .filter((item) => item.type === "musical-number")
      .map((item) => `${item.name}${item.topic ? ` | ${item.topic}` : ""}`)
      .join("\n"),
    announcements: (meeting?.announcements ?? []).join("\n"),
  };
}

// ---------------------------------------------------------------------------
// Formulario
// ---------------------------------------------------------------------------

export default function MeetingForm({
  action,
  meeting,
  submitLabel,
}: MeetingFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const defaults = buildDefaults(meeting);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <p id="meeting-form-help" className="text-sm text-ink-700">
        Fields marked with <span aria-hidden="true">*</span>
        <span className="sr-only">an asterisk</span> are required.
      </p>

      <Fieldset title="When">
        <TextField
          name="date"
          label="Meeting date"
          type="date"
          errors={errors.date}
          defaultValue={defaults.date}
        />
        <SelectField
          name="meetingType"
          label="Meeting type"
          errors={errors.meetingType}
          defaultValue={defaults.meetingType}
          options={MEETING_TYPES}
        />
      </Fieldset>

      <Fieldset title="Presiding and conducting">
        <TextField
          name="presiding"
          label="Presiding"
          errors={errors.presiding}
          defaultValue={defaults.presiding}
        />
        <TextField
          name="conducting"
          label="Conducting"
          errors={errors.conducting}
          defaultValue={defaults.conducting}
        />
      </Fieldset>

      <Fieldset title="Hymns and prayers">
        <ProgramRow
          numberName="openingHymnNumber"
          numberLabel="Opening hymn number"
          numberDefault={defaults.openingHymnNumber}
          numberErrors={errors.openingHymnNumber}
          titleName="openingHymnTitle"
          titleLabel="Opening hymn title"
          titleDefault={defaults.openingHymnTitle}
          titleErrors={errors.openingHymnTitle}
          prayer={{
            name: "openingPrayer",
            label: "Opening prayer",
            defaultValue: defaults.openingPrayer,
            errors: errors.openingPrayer,
          }}
        />
        <ProgramRow
          numberName="sacramentHymnNumber"
          numberLabel="Sacrament hymn number"
          numberDefault={defaults.sacramentHymnNumber}
          numberErrors={errors.sacramentHymnNumber}
          titleName="sacramentHymnTitle"
          titleLabel="Sacrament hymn title"
          titleDefault={defaults.sacramentHymnTitle}
          titleErrors={errors.sacramentHymnTitle}
        />
        <ProgramRow
          numberName="closingHymnNumber"
          numberLabel="Closing hymn number"
          numberDefault={defaults.closingHymnNumber}
          numberErrors={errors.closingHymnNumber}
          titleName="closingHymnTitle"
          titleLabel="Closing hymn title"
          titleDefault={defaults.closingHymnTitle}
          titleErrors={errors.closingHymnTitle}
          prayer={{
            name: "closingPrayer",
            label: "Closing prayer",
            defaultValue: defaults.closingPrayer,
            errors: errors.closingPrayer,
          }}
        />
      </Fieldset>

      <Fieldset title="Business and program">
        <div className="sm:col-span-2">
          <TextAreaField
            name="speakers"
            label="Speakers"
            hint='One per line, as Name | Topic. Example: Jane Doe | Faith through family prayer'
            errors={errors.speakers}
            defaultValue={defaults.speakers}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            name="musicalNumbers"
            label="Musical numbers"
            hint="One per line, as Name | Title. The title is optional."
            errors={errors.musicalNumbers}
            defaultValue={defaults.musicalNumbers}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            name="wardBusiness"
            label="Ward business"
            hint="One item per line."
            errors={errors.wardBusiness}
            defaultValue={defaults.wardBusiness}
          />
        </div>
        <CheckboxField
          name="stakeBusiness"
          label="Stake business is on the program"
          errors={errors.stakeBusiness}
          defaultChecked={defaults.stakeBusiness}
        />
        <div className="sm:col-span-2">
          <TextAreaField
            name="announcements"
            label="Announcements"
            hint="One announcement per line."
            errors={errors.announcements}
            defaultValue={defaults.announcements}
          />
        </div>
      </Fieldset>

      {/* Resumen del envío: los errores por campo ya se anuncian en su región
          viva; aquí se anuncia el fallo global (base de datos, id inválido). */}
      <div aria-live="polite" aria-atomic="true">
        {state.message ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {state.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          aria-disabled={isPending}
          className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/25 transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
        {/* El texto visible ya cambia; esta región solo cubre lectores de
            pantalla, que no anuncian cambios en el nombre de un botón. */}
        <span role="status" className="sr-only">
          {isPending ? "Saving, please wait." : ""}
        </span>
      </div>
    </form>
  );
}