// Tarjeta de una reunión para el listado.
//
// La tarjeta entera es una sola superficie interactiva: el <Link> del título
// se estira con un pseudo-elemento `after:inset-0` hasta cubrir la tarjeta
// (patrón "stretched link"). Los controles de administración viven fuera de ese
// enlace, en una capa con z-10, para que sigan siendo pulsables y para no
// anidar un formulario dentro de un <a>.
import Link from "next/link";
import DeleteMeetingButton from "@/components/DeleteMeetingButton";
import { MEETING_TYPE_LABELS } from "@/lib/types";
import type { SacramentMeeting } from "@/lib/types";

interface MeetingCardProps {
  meeting: SacramentMeeting;
  // Semana 05: los controles de administración (editar y borrar) sólo se pintan
  // con sesión. La autorización real está en el proxy y en requireAuth() dentro
  // de las Server Actions; esto es sólo para no ofrecer botones inútiles.
  isSignedIn?: boolean;
}

function formatMeetingDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function speakerCount(meeting: SacramentMeeting): number {
  return meeting.speakers.filter((item) => item.type === "speaker").length;
}

export default function MeetingCard({
  meeting,
  isSignedIn = false,
}: MeetingCardProps) {
  const count = speakerCount(meeting);
  const formattedDate = formatMeetingDate(meeting.date);
  const label = MEETING_TYPE_LABELS[meeting.meetingType];

  return (
    <article className="group relative flex flex-col rounded-2xl border border-cream-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-500/60 hover:shadow-xl hover:shadow-navy-900/10 has-[:focus-visible]:border-gold-500/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-400/50">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
          {formattedDate}
        </p>
        <span className="rounded-full bg-cream-200/70 px-3 py-1 text-xs font-medium text-navy-900">
          {label}
        </span>
      </div>

      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-navy-900">
        <Link
          href={`/meetings/${meeting.id}`}
          className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
        >
          {label} Meeting
          <span className="sr-only"> on {formattedDate}</span>
        </Link>
      </h2>

      <p className="mt-2 text-sm leading-6 text-ink-700">
        Presided by{" "}
        <span className="font-medium text-navy-900">{meeting.presiding}</span>
        &nbsp;&middot;&nbsp;Conducted by{" "}
        <span className="font-medium text-navy-900">{meeting.conducting}</span>
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-cream-200 pt-4">
        <p className="text-sm text-ink-700">
          {count > 0
            ? `${count} ${count === 1 ? "speaker" : "speakers"} assigned`
            : "No speakers assigned yet"}
        </p>
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gold-700 transition-transform group-hover:translate-x-0.5"
        >
          View agenda
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </span>
      </div>

      {/* Controles de administración: fuera del enlace estirado y sólo con
          sesión iniciada. */}
      {isSignedIn ? (
        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2 no-print">
          <Link
            href={`/meetings/${meeting.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-full border border-cream-200 px-4 py-2 text-xs font-semibold text-navy-900 transition hover:border-gold-400 hover:bg-gold-400/10"
          >
            Edit
            <span className="sr-only"> the {formattedDate} meeting</span>
          </Link>
          <DeleteMeetingButton id={meeting.id} date={meeting.date} />
        </div>
      ) : null}
    </article>
  );
}