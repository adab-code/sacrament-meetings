import Image from "next/image";
import Link from "next/link";
import { WARD_NAME } from "@/lib/meetings-db";

function MusicNoteIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-gold-600"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.7}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"
      />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-gold-600"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.7}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
      />
    </svg>
  );
}

function AnnouncementIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-gold-600"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.7}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
      />
    </svg>
  );
}

const features = [
  {
    icon: MusicNoteIcon,
    title: "Hymns & Music",
    description:
      "Opening, sacrament, and closing hymns with numbers and titles for each meeting.",
  },
  {
    icon: MicrophoneIcon,
    title: "Speakers & Topics",
    description:
      "Assigned speakers and musical numbers, from testimonies to stake conference.",
  },
  {
    icon: AnnouncementIcon,
    title: "Ward Business",
    description:
      "Sustainings, releases, and announcements shared during the weekly service.",
  },
];

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col">
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-navy-800/10 blur-3xl"
        />

        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-5 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">
              {WARD_NAME} &middot; Every Sunday
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-navy-900 sm:text-5xl">
              Worship. Renew. <span className="text-gold-600">Be filled.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-700">
              Explore the weekly sacrament meeting program — the hymns we sing,
              the prayers offered, the speakers who teach, and the business of
              our ward.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/meetings"
                className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/25 transition-all hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-xl"
              >
                View all meetings
              </Link>
              <Link
                href="/meetings/current"
                className="rounded-full border border-gold-500/60 bg-white px-6 py-3 text-sm font-semibold text-gold-700 transition-colors hover:border-gold-600 hover:bg-gold-400/10"
              >
                This Sunday&rsquo;s agenda
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-gold-400/30 via-transparent to-navy-800/15 blur-xl"
            />
            <Image
              src="/meeting-hall.svg"
              alt="Illustration of a meetinghouse with a steeple and rose window"
              width={1200}
              height={630}
              priority
              className="relative h-auto w-full rounded-3xl border border-cream-200 shadow-2xl shadow-navy-900/20"
            />
            <p className="mt-3 text-center text-sm italic text-ink-700">
              Come and worship with us.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-cream-200 bg-white/70">
        <div className="mx-auto grid w-full max-w-5xl gap-4 px-5 py-12 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-cream-200 bg-cream-50 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/20">
                <feature.icon />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-navy-900">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-700">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}