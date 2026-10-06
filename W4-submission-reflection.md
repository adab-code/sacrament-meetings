# W04 Assignment: Sacrament Meeting Planner — Submission

## Project Links

- **GitHub repository:** https://github.com/adab-code/sacrament-meetings (branch `main`, commit `1419b23`)
- **Production URL:** https://sacrament-meetings-team07-7247.vercel.app

## Reflection

**Challenges.** The hardest bug this week was one that types, lint and build all
accepted. Neon's serverless driver serialises *any* JavaScript array as a Postgres
array literal, so `ward_business` and `speakers` — `jsonb` columns that store
lists of objects — were sent as `{"{\"description\":\"...\"}"}` and failed with
`22P02 Expected ":", but found ","`. I found it only by submitting a real form and
reading the server log; the fix was a `JSONB_COLUMNS` set plus a `toJsonb()` helper
applied in both `addMeeting` and `updateMeeting`, while `announcements` (a real
`TEXT[]`) still gets its array directly. The rest of the friction sat at the
SQL/TypeScript boundary carried over from Week 03: `snake_case` columns aliased to
camelCase, the mandatory `as unknown as SacramentMeeting[]` cast, and turning
`params.id` into a trustworthy number with `Number.isInteger` so that `/meetings/abc/edit`
could call `notFound()` instead of querying with `NaN`. Structurally, because the
project uses route groups there is no `app/meetings/` directory, so `error.tsx` and
`not-found.tsx` had to be added inside both `(public)/meetings/` and
`(admin)/meetings/` to cover the same URLs a single `app/`-level file would have.

**Improvements made or considered.** One schema (`MeetingFormSchema`) now validates
the create and edit forms, so server and client cannot disagree; a `23505` on the
unique `date` column is caught and returned as an inline field error instead of a
500; and every mutating action calls `revalidatePath` so the list, detail and edit
pages stay consistent. I also corrected a labelling mistake where the closing prayer
was presented as "Sacrament prayer" beside the sacrament hymn — the database has no
sacrament-prayer column, so that field belonged with the closing hymn. For later I
considered replacing `revalidatePath` with cache tags, adding a real date picker to
the `input[type=date]`, validating the hymn numbers as integers with `z.coerce`
instead of relying on the browser's `type="number"`, and moving multi-line fields
to repeatable sub-forms. The most important next step is Week 05 authentication —
right now anyone who knows the URL can create, edit and delete meetings.

**How I used AI.** AI was a review and diagnostic partner, not the author. I asked
conceptual questions first (why a `jsonb` column should be stringified manually,
why `notFound()` beats throwing, how a Server Action stays safe without route
handlers), then wrote the SQL, the actions and the components myself. When something
failed I pasted the exact error and asked for the smallest correct fix rather than a
rewrite, and I re-ran `npm run lint`, `npx tsc --noEmit` and `npm run build` after
every change. Running structured review prompts (bugs, accessibility, App Router
usage, type safety, missing requirements) paid off for the `aria-invalid` /
`aria-describedby` / `aria-live` wiring, the column whitelist in `updateMeeting` and
the two-step delete confirmation. Two limits are worth recording: AI did not
anticipate the Neon array-serialisation trap, and its first fix for the
prayer-labelling problem simply re-swapped two props and was still wrong, so I
verified behaviour by hand instead of trusting the suggestion. The check that paid
for itself was scripted progressive-enhancement testing — reusing the real
`$ACTION_*` hidden fields with curl to exercise create, edit, duplicate-date and
delete against Neon and then confirm the table was back to its original 15 rows.
I did not delegate the SQL, the validation schema, the commits, or the production
promotion.
