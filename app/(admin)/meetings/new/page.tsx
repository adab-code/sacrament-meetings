// Alta de reunión (/meetings/new).
//
// Server Component: pasa el Server Action createMeeting al formulario cliente,
// que se encarga de useActionState y de pintar los errores por campo.
import Link from "next/link";
import MeetingForm from "@/components/MeetingForm";
import { createMeeting } from "@/lib/actions";

export default function NewMeetingPage() {
  return (
    <div>
      <Link
        href="/meetings"
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
        All meetings
      </Link>

      <header className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
          Admin
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
          Create meeting
        </h1>
        <p className="mt-3 text-ink-700">
          Fill in the program for a new sacrament meeting. One meeting is
          allowed per date.
        </p>
      </header>

      <div className="mt-8">
        <MeetingForm action={createMeeting} submitLabel="Create meeting" />
      </div>
    </div>
  );
}