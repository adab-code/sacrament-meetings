// Server Actions de la sección de reuniones.
//
// Todas las mutaciones (crear, editar, borrar) entran por aquí: los formularios
// nunca hablan con la base de datos directamente. Cada acción sigue el mismo
// contrato:
//   1. Valida el FormData con Zod en el servidor (fuente de verdad).
//   2. Si la validación falla devuelve errores por campo (error esperado) para
//      que el formulario los pinte junto al input.
//   3. Si la base de datos falla por una causa inesperada, se registra y se
//      relanza un Error legible que recoge el error.tsx del segmento.
//
// Nota: 'use server' solo permite exportar funciones async (y tipos, que se
// borran al compilar), así que el esquema y los helpers son privados.
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  addMeeting,
  deleteMeeting as deleteMeetingRow,
  updateMeeting as updateMeetingRow,
} from "./meetings-db";
import type {
  Hymn,
  MeetingType,
  SacramentMeeting,
  SpeakerItem,
  WardBusinessItem,
} from "./types";

const MEETING_TYPES = [
  "testimony",
  "regular",
  "stake",
  "general",
  "special",
] as const satisfies readonly MeetingType[];

// Código de Postgres para violación de restricción única (date es UNIQUE).
const UNIQUE_VIOLATION = "23505";

// ---------------------------------------------------------------------------
// Estado devuelto a los formularios
// ---------------------------------------------------------------------------

export type MeetingField =
  | "date"
  | "meetingType"
  | "presiding"
  | "conducting"
  | "openingHymnNumber"
  | "openingHymnTitle"
  | "openingPrayer"
  | "sacramentHymnNumber"
  | "sacramentHymnTitle"
  | "closingHymnNumber"
  | "closingHymnTitle"
  | "closingPrayer"
  | "wardBusiness"
  | "stakeBusiness"
  | "speakers"
  | "musicalNumbers"
  | "announcements";

// Estado que consume useActionState. `errors` lleva un array de mensajes por
// cada input, y `message` un resumen para mostrar junto al botón de envío.
export type MeetingFormState = {
  errors?: Partial<Record<MeetingField, string[]>>;
  message?: string | null;
};

// ---------------------------------------------------------------------------
// Esquema de validación (Zod)
// ---------------------------------------------------------------------------

// Divide un textarea en líneas no vacías.
function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// Nombre de persona: no vacío y dentro del VARCHAR(255) de la columna.
function nameField(label: string) {
  return z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(255, `${label} must be 255 characters or fewer.`);
}

// Número de himno: <input type="number"> devuelve texto o cadena vacía.
function hymnNumberField(label: string) {
  return z.coerce
    .number({ error: `${label} is required.` })
    .int(`${label} must be a whole number.`)
    .min(1, `${label} must be 1 or higher.`)
    .max(1000, `${label} must be 1000 or lower.`);
}

// Una fecha ISO 'YYYY-MM-DD' que además existe en el calendario (rechaza
// valores como 2026-02-31, que el calendario gregoriano normalizaría a marzo).
const isoDateField = z
  .string({ error: "Date is required." })
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker to choose a valid date.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const candidate = new Date(year, month - 1, day);
    return (
      candidate.getFullYear() === year &&
      candidate.getMonth() === month - 1 &&
      candidate.getDate() === day
    );
  }, "That date does not exist in the calendar.");

// Los campos multilínea se validan "por líneas" para poder señalar en qué
// línea está el problema sin abandonar la validación por campo.
function speakerLinesField() {
  return z.string().superRefine((value, ctx) => {
    splitLines(value).forEach((line, index) => {
      const [name, topic] = line.split("|").map((part) => part.trim());
      if (!name) {
        ctx.addIssue({
          code: "custom",
          message: `Line ${index + 1}: add a speaker name.`,
        });
      }
      if (!topic) {
        ctx.addIssue({
          code: "custom",
          message: `Line ${index + 1}: add a topic, like "Name | Topic".`,
        });
      }
    });
  });
}

const MeetingFormSchema = z.object({
  date: isoDateField,
  meetingType: z.enum(MEETING_TYPES, {
    message: "Choose one of the available meeting types.",
  }),
  presiding: nameField("Presiding"),
  conducting: nameField("Conducting"),
  openingHymnNumber: hymnNumberField("Opening hymn number"),
  openingHymnTitle: nameField("Opening hymn title"),
  openingPrayer: nameField("Opening prayer"),
  sacramentHymnNumber: hymnNumberField("Sacrament hymn number"),
  sacramentHymnTitle: nameField("Sacrament hymn title"),
  closingHymnNumber: hymnNumberField("Closing hymn number"),
  closingHymnTitle: nameField("Closing hymn title"),
  closingPrayer: nameField("Closing prayer"),
  wardBusiness: z.string(),
  stakeBusiness: z.boolean(),
  speakers: speakerLinesField(),
  musicalNumbers: z.string(),
  announcements: z.string(),
});

type MeetingFormInput = z.infer<typeof MeetingFormSchema>;

// ---------------------------------------------------------------------------
// Traducción entre el formulario y el modelo de dominio
// ---------------------------------------------------------------------------

// Lee el FormData plano y lo normaliza a los tipos que espera el esquema
// (números, checkbox y listas de una línea por elemento).
function readFormData(formData: FormData) {
  const text = (name: MeetingField): string => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };

  return {
    date: text("date"),
    meetingType: text("meetingType"),
    presiding: text("presiding"),
    conducting: text("conducting"),
    openingHymnNumber: text("openingHymnNumber"),
    openingHymnTitle: text("openingHymnTitle"),
    openingPrayer: text("openingPrayer"),
    sacramentHymnNumber: text("sacramentHymnNumber"),
    sacramentHymnTitle: text("sacramentHymnTitle"),
    closingHymnNumber: text("closingHymnNumber"),
    closingHymnTitle: text("closingHymnTitle"),
    closingPrayer: text("closingPrayer"),
    wardBusiness: text("wardBusiness"),
    // Un checkbox no marcado simplemente no llega en el FormData.
    stakeBusiness: formData.get("stakeBusiness") === "on",
    speakers: text("speakers"),
    musicalNumbers: text("musicalNumbers"),
    announcements: text("announcements"),
  };
}

function toHymn(number: number, title: string): Hymn {
  return { number, title };
}

function toMeeting(input: MeetingFormInput): Omit<SacramentMeeting, "id"> {
  const speakers: SpeakerItem[] = splitLines(input.speakers).map((line) => {
    const [name, topic] = line.split("|").map((part) => part.trim());
    return { name, topic, type: "speaker" };
  });

  // Los números musicales solo necesitan nombre; el topic guarda la pieza.
  for (const line of splitLines(input.musicalNumbers)) {
    const [name, topic] = line.split("|").map((part) => part.trim());
    speakers.push({ name, topic, type: "musical-number" });
  }

  const wardBusiness: WardBusinessItem[] = splitLines(input.wardBusiness).map(
    (description) => ({ description })
  );

  return {
    date: input.date,
    meetingType: input.meetingType,
    presiding: input.presiding,
    conducting: input.conducting,
    announcements: splitLines(input.announcements),
    openingHymn: toHymn(input.openingHymnNumber, input.openingHymnTitle),
    openingPrayer: input.openingPrayer,
    wardBusiness,
    stakeBusiness: input.stakeBusiness,
    sacramentHymn: toHymn(
      input.sacramentHymnNumber,
      input.sacramentHymnTitle
    ),
    speakers,
    closingHymn: toHymn(input.closingHymnNumber, input.closingHymnTitle),
    closingPrayer: input.closingPrayer,
  };
}

// Traduce un error de Neon/Postgres a un error de campo cuando tiene sentido
// (una fecha duplicada es un error esperado del formulario, no un fallo).
function duplicateDateField(error: unknown): MeetingFormState | null {
  const code = (error as { code?: string } | null)?.code;
  if (code !== UNIQUE_VIOLATION) {
    return null;
  }
  return {
    errors: { date: ["A meeting already exists on that date."] },
    message: "Failed to save the meeting.",
  };
}

// Refresca el listado y, si aplica, la página de detalle de la reunión.
function revalidateMeetings(id?: number) {
  revalidatePath("/meetings");
  revalidatePath("/meetings/current");
  if (id !== undefined) {
    revalidatePath(`/meetings/${id}`);
    revalidatePath(`/meetings/${id}/edit`);
  }
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------

// Crea una reunión. Pensada para useActionState, por eso recibe prevState.
export async function createMeeting(
  _prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const parsed = MeetingFormSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Check the highlighted fields and try again.",
    };
  }

  let created: SacramentMeeting;
  try {
    created = await addMeeting(toMeeting(parsed.data));
  } catch (error) {
    console.error("Error creating meeting:", error);
    const expected = duplicateDateField(error);
    if (expected) {
      return expected;
    }
    throw new Error(
      "Failed to create the meeting. Please try again in a moment."
    );
  }

  revalidateMeetings(created.id);
  redirect(`/meetings/${created.id}`);
}

// Actualiza una reunión existente. El id se inyecta con .bind(null, id) en el
// formulario de edición, así que llega antes que prevState.
export async function updateMeeting(
  id: number,
  _prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  if (!Number.isInteger(id) || id <= 0) {
    return { message: "That meeting id is not valid." };
  }

  const parsed = MeetingFormSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Check the highlighted fields and try again.",
    };
  }

  try {
    const updated = await updateMeetingRow(id, toMeeting(parsed.data));
    if (!updated) {
      return { message: "That meeting no longer exists." };
    }
  } catch (error) {
    console.error(`Error updating meeting ${id}:`, error);
    const expected = duplicateDateField(error);
    if (expected) {
      return expected;
    }
    throw new Error(
      "Failed to update the meeting. Please try again in a moment."
    );
  }

  revalidateMeetings(id);
  redirect(`/meetings/${id}`);
}

// Borra una reunión. Se enlaza con .bind(null, id) en el botón de cada tarjeta;
// no necesita estado porque no devuelve feedback al usuario.
export async function deleteMeeting(id: number): Promise<void> {
  let removed: boolean;
  try {
    removed = await deleteMeetingRow(id);
  } catch (error) {
    console.error(`Error deleting meeting ${id}:`, error);
    throw new Error(
      "Failed to delete the meeting. Please try again in a moment."
    );
  }

  if (!removed) {
    // El id llegó desde la UI pero la fila ya no está: otro proceso la borró.
    throw new Error("That meeting no longer exists.");
  }

  revalidateMeetings(id);
  redirect("/meetings");
}