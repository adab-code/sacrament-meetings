// Detalle de una reunión (/meetings/[id]). Valida el id de la URL y
// devuelve un 404 cuando es inválido o la reunión no existe.
//
// También resuelve la sesión (Semana 05) para mostrar u ocultar el enlace de
// edición. Sesión y reunión se piden en paralelo porque no dependen una de otra.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MeetingDetail from "@/components/MeetingDetail";
import { auth } from "@/auth";
import { fetchMeetingById } from "@/lib/api";
import { MEETING_TYPE_LABELS } from "@/lib/types";

// Metadatos propios de cada reunión (Semana 05).
//
// Se generan aquí y no con un `metadata` estático porque dependen del registro:
// el título lleva la fecha y la descripción el programa. Los dos valores se
// piden con la misma función memoizada que usa la página, así que la reunión se
// lee una sola vez por petición.
//
// Si la reunión no existe se llama a `notFound()` (no se devuelve un título
// alternativo). Es deliberado: la página también terminaría en `notFound()`, pero
// resolver los metadatos primero hace que Next.js envíe las cabeceras, y para
// entonces el estado ya ha quedado fijado en 200. Lanzar aquí el error de
// not-found garantiza que la respuesta sea un 404 de verdad, que es lo que
// necesitan los buscadores para no indexar páginas inexistentes.
export async function generateMetadata({
  params,
}: PageProps<"/meetings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const meetingId = Number(id);

  if (!Number.isInteger(meetingId)) {
    notFound();
  }

  const meeting = await fetchMeetingById(meetingId);

  if (!meeting) {
    notFound();
  }

  const [year, month, day] = meeting.date.split("-").map(Number);
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );
  const typeLabel = MEETING_TYPE_LABELS[meeting.meetingType];

  // Los oradores van en la descripción: es el contenido que de verdad diferencia
  // una reunión de otra en un resultado de búsqueda.
  const speakerNames = meeting.speakers
    .filter((item) => item.type === "speaker")
    .map((item) => item.name);
  const description = `${typeLabel} sacrament meeting on ${formattedDate}, presided by ${meeting.presiding} and conducted by ${meeting.conducting}.${
    speakerNames.length > 0 ? ` Speakers: ${speakerNames.join(", ")}.` : ""
  }`;

  return {
    title: `${typeLabel} · ${formattedDate}`,
    description,
    openGraph: {
      title: `${typeLabel} · ${formattedDate}`,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${typeLabel} · ${formattedDate}`,
      description,
    },
  };
}

export default async function MeetingPage(
  props: PageProps<"/meetings/[id]">
) {
  const { id } = await props.params;
  const meetingId = Number(id);

  if (!Number.isInteger(meetingId)) {
    notFound();
  }

  const [session, meeting] = await Promise.all([
    auth(),
    fetchMeetingById(meetingId),
  ]);

  if (!meeting) {
    notFound();
  }

  return (
    <MeetingDetail meeting={meeting} isSignedIn={!!session?.user} />
  );
}
