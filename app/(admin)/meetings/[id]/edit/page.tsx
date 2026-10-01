// Edición de reunión (/meetings/[id]/edit).
//
// Server Component: resuelve la reunión desde el segmento dinámico de la URL y
// pasa a updateMeeting el id ya enlazado (.bind), de modo que la acción no
// depende de ningún campo oculto en el formulario.
//
// Si el id no es un entero válido o la reunión no existe, notFound() corta el
// render y se muestra el not-found.tsx de este mismo segmento (no el error.tsx).
import Link from "next/link";
import { notFound } from "next/navigation";
import MeetingForm from "@/components/MeetingForm";
import { updateMeeting } from "@/lib/actions";
import { getMeetingById } from "@/lib/meetings-db";

export default async function EditMeetingPage(
  props: PageProps<"/meetings/[id]/edit">
) {
  const { id } = await props.params;
  const meetingId = Number(id);

  if (!Number.isInteger(meetingId) || meetingId <= 0) {
    notFound();
  }

  const meeting = await getMeetingById(meetingId);

  if (!meeting) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/meetings/${meeting.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 transition-colors hover:text-navy-900"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Back to the agenda
      </Link>

      <header className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
          Admin
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
          Edit meeting
        </h1>
        <p className="mt-3 text-ink-700">
          Update the program for this meeting. Changing the date keeps the same
          unique-date rule as the rest of the ward.
        </p>
      </header>

      <div className="mt-8">
        <MeetingForm
          action={updateMeeting.bind(null, meeting.id)}
          meeting={meeting}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}