// Detalle imprimible de una reunión (el programa completo, listo para impresión
// vía CSS). Es componente cliente por el botón Print (window.print()).
"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MEETING_TYPE_LABELS } from "@/lib/types";
import type { Hymn, SacramentMeeting } from "@/lib/types";

interface MeetingDetailProps {
  meeting: SacramentMeeting;
}

function formatMeetingDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function hymnLabel(hymn: Hymn): string {
  return `${hymn.number} \u00b7 ${hymn.title}`;
}

function ProgramItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-cream-200 py-3 first:border-t-0 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="w-40 shrink-0 text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
        {label}
      </dt>
      <dd className="text-[15px] text-ink-800">{value}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 mt-10 font-display text-2xl font-semibold tracking-tight text-navy-900 first:mt-0">
      {children}
    </h2>
  );
}

function getInitials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.charAt(0));
  return letters.join("");
}

export default function MeetingDetail({ meeting }: MeetingDetailProps) {
  return (
    <article>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
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
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/meetings/${meeting.id}/edit`}
            className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-500/60 hover:bg-gold-400/10"
          >
            Edit
            <span className="sr-only"> this meeting</span>
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-navy-900/25 transition-all hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-xl"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659"
              />
            </svg>
            Print
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-xl shadow-navy-900/5">
        <header className="border-b border-cream-200 bg-gradient-to-b from-cream-100/80 to-white px-6 py-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-700">
            {MEETING_TYPE_LABELS[meeting.meetingType]} Meeting
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
            Sacrament Meeting
          </h1>
          <p className="mt-2 text-ink-700">{formatMeetingDate(meeting.date)}</p>
          <div
            aria-hidden="true"
            className="mx-auto mt-6 flex w-40 items-center justify-center gap-2 text-gold-500"
          >
            <span className="h-px flex-1 bg-gold-500/60" />
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 0l1.5 4.5L12 6 7.5 7.5 6 12 4.5 7.5 0 6l4.5-1.5L6 0z" />
            </svg>
            <span className="h-px flex-1 bg-gold-500/60" />
          </div>
        </header>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <dl>
            <ProgramItem label="Presiding" value={meeting.presiding} />
            <ProgramItem label="Conducting" value={meeting.conducting} />
            <ProgramItem label="Opening hymn" value={hymnLabel(meeting.openingHymn)} />
            <ProgramItem label="Opening prayer" value={meeting.openingPrayer} />
            <ProgramItem label="Sacrament hymn" value={hymnLabel(meeting.sacramentHymn)} />
            <ProgramItem label="Closing hymn" value={hymnLabel(meeting.closingHymn)} />
            <ProgramItem label="Closing prayer" value={meeting.closingPrayer} />
          </dl>

          {meeting.wardBusiness.length > 0 && (
            <section>
              <SectionTitle>Ward Business</SectionTitle>
              <ul className="space-y-2.5">
                {meeting.wardBusiness.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"
                    />
                    <span className="text-[15px] leading-6 text-ink-800">
                      {item.description}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] text-ink-800">
                <span className="font-medium text-navy-900">Stake business:</span>{" "}
                {meeting.stakeBusiness ? "Yes" : "No"}
              </p>
            </section>
          )}

          <section>
            <SectionTitle>Speakers &amp; Musical Numbers</SectionTitle>
            {meeting.speakers.length === 0 ? (
              <p className="text-ink-700">No speakers assigned yet.</p>
            ) : (
              <ul className="space-y-4">
                {meeting.speakers.map((speaker, index) => (
                  <li
                    key={`${speaker.name}-${index}`}
                    className="flex items-start gap-4 rounded-2xl border border-cream-200 p-4 transition-colors hover:bg-cream-50"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-navy-900 font-display text-base font-semibold text-gold-300"
                    >
                      {getInitials(speaker.name)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-navy-900">
                          {speaker.name}
                        </p>
                        <span className="rounded-full bg-cream-200/70 px-3 py-1 text-xs font-medium text-navy-900">
                          {speaker.type === "musical-number"
                            ? "Musical number"
                            : "Speaker"}
                        </span>
                      </div>
                      {speaker.type === "speaker" && speaker.topic && (
                        <p className="mt-1 text-sm leading-6 text-ink-700">
                          Topic: {speaker.topic}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {meeting.announcements && meeting.announcements.length > 0 && (
            <section>
              <SectionTitle>Announcements</SectionTitle>
              <ul className="space-y-2.5">
                {meeting.announcements.map((announcement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"
                    />
                    <span className="text-[15px] leading-6 text-ink-800">
                      {announcement}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}