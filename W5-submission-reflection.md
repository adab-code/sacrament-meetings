# W05 Assignment: Sacrament Meeting Planner — Submission

## Project Links

- **GitHub repository:** https://github.com/adab-code/sacrament-meetings (branch `main`)
- **Production URL:** https://sacrament-meetings-team07-7247.vercel.app

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