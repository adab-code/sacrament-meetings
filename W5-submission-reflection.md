# W05 Assignment: Sacrament Meeting Planner — Submission

## Project Links

- **GitHub repository:** https://github.com/adab-code/sacrament-meetings (branch `main`, commit `555b432`)
- **Production URL:** https://sacrament-meetings-team07-7247.vercel.app
- **Sign in at** `/login` with the account `bishopric@provo1stward.org`
  (role `bishopric`). The password is shared with the grader out of band rather
  than committed here, since this repository is public and a plaintext password
  in a README would contradict the storage rules described in it.
- **Build note:** the build compiles without secrets, but login needs
  `AUTH_SECRET` and `AUTH_TRUST_HOST` in the Vercel environment variables;
  without them the session cookie cannot be encrypted or decrypted.

## What I added this week

**A protected authentication route.** Login is Auth.js v5 with the `Credentials`
provider, checking a bcrypt hash in a new Neon `users` table. Two routes are
protected by `proxy.ts` — `/meetings/new` and `/meetings/[id]/edit` — and each
answers `307` to `/login?callbackUrl=…` without a session. The public reading
routes (`/`, `/meetings`, `/meetings/[id]`, `/meetings/current`) stay open on
purpose, and only one role exists, so authorisation is not yet a matrix. The
lesson of the week is that the proxy is not the whole story: a Server Action is a
public POST endpoint the proxy never sees, so `requireAuth()` also runs inside
`createMeeting`, `updateMeeting` and `deleteMeeting`. Hiding the buttons is
presentation; the action guard is the protection.

**Metadata added.**

| Route | What it now emits |
| --- | --- |
| `app/layout.tsx` | `title.default` + `title.template` (`%s \| Provo 1st Ward`), description, `applicationName`, keywords, `metadataBase`, and shared `openGraph` / `twitter` defaults |
| `app/(public)/meetings/page.tsx` | Static `title: "Meetings"` and a list-specific description |
| `app/(public)/meetings/[id]/page.tsx` | `generateMetadata()` building the title from the record — e.g. *"Testimony · Sunday, January 4, 2026"* — plus a description with presiding, conducting and speakers, and `og:type: article` |
| `app/not-found.tsx` | Its own `title`/`description`, so a 404 stops inheriting the site-wide default |
| `app/opengraph-image.tsx` | A generated 1200×630 Open Graph image via `ImageResponse`, served at `/opengraph-image` |
| `app/robots.ts` | Robots Exclusion Standard directives plus a pointer to the sitemap |
| `app/sitemap.ts` | `/sitemap.xml` with the home, the list and one URL per meeting |

`metadataBase` is the load-bearing piece: without it `og:image` stays relative and
social networks cannot fetch it. `fetchMeetingById` is wrapped in React's
`cache()` so that adding `generateMetadata` did not double the database reads per
detail view.

`robots.ts` and `sitemap.ts` import the site URL from `lib/config.ts` instead of
hard-coding the domain, so a deployment change cannot leave the sitemap pointing
at the old host.

## Reflection

**Challenges.** The framing question for this week was which of the three
credential options to pick, and it decided everything downstream. Credentials
meant no third-party consent screen and full control of the login UI, at the
price of having to own password storage myself; OAuth and an off-the-shelf
provider would have given me neither table nor session to reason about. I chose
credentials because the course explicitly wants a real login form, and because a
Neon table plus one bcrypt column is a smaller surface to get wrong than a
redirect flow I could not fully inspect.

Two version traps cost me real time. First, this project runs Next.js 16, where
the authentication middleware file is `proxy.ts`; placing `NextAuth(...).auth` in
the familiar `middleware.ts` simply does nothing, and the only reason I noticed
was that the build output listed no middleware at all. Second, `next-auth` is
still on a beta, and the beta I installed has the fix for `GHSA-8fpg-xm3f-6cx3` —
so "upgrade to latest" was not a safe default this week, it was a decision I had
to check. Both were invisible to types, lint and build.

The subtle bug was in a single line of the `authorized` callback. I first wrote
the pattern I had seen in older examples, `if (auth) return true;` and nothing
otherwise, which returns `undefined` when there is no session. `undefined` is
falsy, so the routes happened to stay closed and every test passed. It is still
wrong, because it makes "deny" indistinguishable from "no opinion" to anything
that inspects the return value, so it now reads `!!auth?.user`. I only caught
this by writing the table of every possible session state and asking what each
branch returns.

A smaller version of the same mistake happened building the sitemap. I assumed
`getMeetings("", 0)` would mean "no pagination" because that is how several of
its parameters default. It does not: the function always computes an OFFSET from
the page, so page `0` produces `offset = -ITEMS_PER_PAGE`, which Postgres rejects.
The assumption also carried a second cost — `getMeetings` selects every `jsonb`
column when the sitemap only needs `id` and `date`. Rather than patch around it I
added a small `getMeetingIndex()` with the projection the sitemap actually needs.

**Improvements made or considered.** I split the configuration into
`auth.config.ts` and `auth.ts` so the proxy imports only the callbacks and never
drags `bcrypt` and the Neon driver into the edge bundle. I discovered that
protecting pages is not the same as protecting writes: a Server Action is a
public POST endpoint that the proxy never sees, so `requireAuth()` runs again
inside each action — the hidden-button check is only presentation. I also
wrapped `fetchMeetingById` in React's `cache()` once the detail route grew a
`generateMetadata`, because metadata and page each asked for the meeting and
without memoisation the page made two round trips per view. For later I would add
a rate limit to the login action, add `users` management instead of a single
seeded account, and validate the slug in the proxy if I ever need hard 404
status codes on missing meetings.

The one thing worth flagging is a trade-off rather than a win. Adding
`generateMetadata` to `/meetings/[id]` silently changed missing-meeting responses
from a real `404` to a `200`, because resolving metadata flushes the response
headers before the page can call `notFound()`. My first fix — throwing
`notFound()` from inside `generateMetadata` — fixed the rendered output but not
the status code, which is what sent me to the docs and confirmed it is inherent
to streamed responses. Next.js injects `noindex` in that case, so search engines
will not index those URLs, and the docs suggest checking in the proxy to get a
hard 404 at the cost of a query on every detail view. I chose the documented
default and wrote down why rather than paying the cost silently.

**How I used AI.** AI was a review and diagnostic partner, not the author. I
brought the conceptual decisions — credentials versus a provider, why the proxy
must not import the bcrypt path, whether hiding a button is ever authorisation —
and wrote the auth config, the callbacks, the table, the seed script and the UI
myself. The most valuable thing it did was push me to enumerate states instead of
spot-checking the happy path; the `!!auth?.user` fix and the `cache()` wrapping
both came from that. Its limits this week were sharp: it initially produced a
working-looking `authorized` callback with the `undefined` hole, its first
suggestion for the 404 problem was to return fallback metadata, which looked
right in the HTML and left the status code wrong, and it twice emitted stray
non-English characters into Spanish comments and into a README table, which I
found with a Unicode-range grep and fixed. None of those would have been caught
by `npm run lint` or `tsc`. What did work was scripted verification instead of
assertion: I backed up the account's bcrypt hash before rotating it for testing
and restored it byte-for-byte afterwards, then proved restoration by confirming
the throwaway password no longer authenticates. Across the auth flow I checked
that the three protected routes 307 to `/login`, that the public routes stay 200,
that the session contains `role` and no `passwordHash`, that a wrong password,
an unknown email and a forged CSRF token each yield no session cookie, that
logout revokes access, and that the Open Graph route returns a real PNG. I did
not delegate the credentials handling, the schema, the commits, or the
production promotion.