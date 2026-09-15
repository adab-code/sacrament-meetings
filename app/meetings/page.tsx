import Link from "next/link";
import MeetingCard from "@/components/MeetingCard";
import { fetchMeetings } from "@/lib/api";

export default async function MeetingsPage() {
  const meetings = await fetchMeetings();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 print:mb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
            Weekly Programs
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-navy-900">
            Meetings
          </h1>
          <p className="mt-2 text-ink-700">
            Recent and upcoming sacrament meeting agendas.
          </p>
        </div>
        <Link
          href="/meetings/current"
          className="no-print rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/25 transition-all hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-xl"
        >
          This Sunday
        </Link>
      </div>

      {meetings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-6 py-16 text-center">
          <p className="font-display text-xl font-semibold text-navy-900">
            No meetings yet
          </p>
          <p className="mt-2 text-ink-700">
            Check back soon for upcoming sacrament meeting programs.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </>
  );
}