// Tarjeta de una reunión para el listado. La tarjeta completa es un enlace
// al detalle (/meetings/[id]).
import Link from "next/link";
import { MEETING_TYPE_LABELS } from "@/lib/types";
import type { SacramentMeeting } from "@/lib/types";

interface MeetingCardProps {
  meeting: SacramentMeeting;
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

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const count = speakerCount(meeting);

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="group flex flex-col rounded-2xl border border-cream-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-500/60 hover:shadow-xl hover:shadow-navy-900/10"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
          {formatMeetingDate(meeting.date)}
        </p>
        <span className="rounded-full bg-cream-200/70 px-3 py-1 text-xs font-medium text-navy-900">
          {MEETING_TYPE_LABELS[meeting.meetingType]}
        </span>
      </div>

      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-navy-900">
        {MEETING_TYPE_LABELS[meeting.meetingType]} Meeting
      </h2>

      <p className="mt-2 text-sm leading-6 text-ink-700">
        Presided by <span className="font-medium text-navy-900">{meeting.presiding}</span>
        &nbsp;&middot;&nbsp;Conducted by{" "}
        <span className="font-medium text-navy-900">{meeting.conducting}</span>
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-cream-200 pt-4 [margin-top:auto]">
        <p className="text-sm text-ink-700">
          {count > 0
            ? `${count} ${count === 1 ? "speaker" : "speakers"} assigned`
            : "No speakers assigned yet"}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 transition-transform group-hover:translate-x-0.5">
          View agenda
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
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}