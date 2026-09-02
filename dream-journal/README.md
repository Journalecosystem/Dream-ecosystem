# Dream Journal, complete: Phases 1 through 4

The full Dream Journal ecosystem website, all four phases, built into one
codebase. Capture, examine, process, interpret, test, track fulfillment,
build a timeline, notice connections, keep private testimonies, read the
Vault, and share dreams in Circles.

## Stack

Next.js 15, App Router, TypeScript, Tailwind CSS, Supabase (Postgres, Auth),
self-hosted Fraunces and Inter fonts (no external font fetch at build time).

## Setup

1. Create a new Supabase project at supabase.com.
2. In the Supabase SQL editor, run all five migration files in order:
   `0001_init.sql`, `0002_phase2.sql`, `0003_phase3.sql`, `0004_phase4.sql`,
   `0005_semantic_search.sql`, from `supabase/migrations/`. The fourth
   also seeds a handful of real Vault entries and two starter Circles, so
   those sections are not empty on first launch. The fifth enables the
   pgvector extension, which is available on all Supabase projects.
3. Copy `.env.local.example` to `.env.local` and fill in the three values
   from your Supabase project's Settings, API page:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — used only by the account deletion route,
     never exposed to the browser. Keep this out of version control.
   - `ANTHROPIC_API_KEY` — optional. Powers the Scripture reference
     suggestions on the interpretation screen. Get one at
     console.anthropic.com. If you skip this, that one feature silently
     does nothing rather than breaking the page.
   - `ADMIN_EMAILS` — comma separated list of email addresses allowed to
     reach `/admin`. Add your own email here to manage Vault content and
     Circles from the app instead of Supabase's table editor.
   - `OPENAI_API_KEY` — optional. Powers "search by meaning" on the
     dreams list. Skip it and that search mode falls back to exact word
     search automatically.
4. Install dependencies and run the dev server:

```
npm install
npm run dev
```

5. Visit `http://localhost:3000`, create an account, and you land straight
   in the capture flow.

## Deploying

Push this to a GitHub repo and import it in Vercel, or run `vercel` from
this directory. Add the same three environment variables in the Vercel
project settings before the first deploy. No other configuration is
required.

## What is built

- `/` — landing page with the disclaimer that this tool aids reflection and
  does not replace Scripture, prayer, or counsel
- `/auth` — sign up and sign in
- `/dreams` — searchable, filterable list of the signed in user's dreams
- `/dreams/new` — fast capture, a narrative is the only required field
- `/dreams/[id]` — full detail view: narrative, examination, people and
  relationships, environmental and symbolic details, processing, and a dream
  type classification that stays editable at any time
- `/dreams/[id]/edit` — title, date, and dream type, plus delete
- `/account` — full data export as JSON, and account deletion behind a
  typed confirmation step

Phase 2 adds:

- `/dreams/[id]/interpret` — new interpretation version, with an optional
  Scripture suggestion sidebar if `ANTHROPIC_API_KEY` is set. The AI never
  states a meaning, only surfaces references to consider, and every
  suggestion is visually separated from the user's own writing
- Interpretation and Source Testing sections on `/dreams/[id]`, plus a
  standalone `/dreams/[id]/source-testing` route
- `/symbols` — personal symbol library across all dreams, where the user's
  own recorded meaning always displays above anything else
- A recurring themes panel on `/dreams`, computed directly from the
  database rather than by AI, since exact recurrence counting does not
  need a probabilistic answer. Labeled explicitly as pattern recognition,
  not prophecy

## What is deliberately not built yet

Fulfillment tracking, the timeline, the dream graph, the Vault, and
Circles all belong to later phases. Their schema for fulfillment already
exists in the Phase 1 migration (`fulfillment_records`) so that phase
needs no destructive migration, but no screen touches it yet. Do not
build ahead of the current phase.

One Phase 2 item was intentionally trimmed from the original build prompt:
full AI assisted semantic search across entries was scoped down to the
deterministic recurring themes panel described above. True semantic
search would need an embeddings pipeline and a vector column, which is a
meaningful enough addition to warrant its own pass rather than being
folded in silently here.

## Phase 3, the longitudinal layer

- `/dreams/[id]/fulfillment` — record an outcome against a dream, status
  always chosen explicitly by the user, never inferred
- `/dreams/[id]/testimony` — build a private testimony, only reachable
  once a fulfillment record exists for that dream
- `/timeline` — full chronological history with filters for every status
  named in the original spec (awaiting interpretation, awaiting testing,
  awaiting fulfillment, fulfilled, unresolved, recurring). Default view is
  plain chronological order, not sorted toward the dramatic
- `/graph` — connections between dreams that share a symbol or a person.
  Built as a plain relationship list rather than a rendered node and edge
  visualization, since a genuine interactive graph canvas is a substantial
  piece of work on its own and a list serves the same "notice a pattern
  across time" purpose honestly. Worth a dedicated pass if you want the
  fuller visual version
- `/testimonies` — private list of everything learned, not just what
  happened

## Phase 4, the ecosystem layer

- `/vault` and its category and entry routes — seeded with five real
  entries across the interpretation framework, symbol library, case
  studies, and prayer resources categories, not placeholder text. Add
  more directly in Supabase's table editor on `vault_content`, there is no
  in app authoring tool built for this yet
- `/circles` and its routes — two starter circles seeded. A member cannot
  post without first accepting the guidelines, and every response is
  structurally limited to a question or an observation, there is no
  option in the schema for posting a verdict on someone else's dream
- `/formation` — descriptive progress across all four phases, computed
  from real usage, deliberately not a points or badge system

## Voice capture

On `/dreams/new`, a "Speak your dream instead" button appears when your
browser supports it, using the Web Speech API built into the browser
itself, no API key, no server call, no added latency. Speech is
transcribed live into the same narrative box, which stays fully editable
afterward since speech recognition is never perfect. A dream saved this
way is tagged `capture_method: voice` and shows "captured by voice" on
its detail page.

This works in Chrome, Edge, and most Chromium based browsers, and in
Safari on iOS and macOS. It is not supported in Firefox. Where it is not
supported, the button simply does not appear rather than showing
something broken. There is no dedicated audio recording and server side
transcription fallback for unsupported browsers, since the Web Speech
API alone covers the large majority of mobile and desktop use where
speed matters most, which is the actual goal here. A Whisper based
fallback is a reasonable follow up if Firefox support turns out to
matter to your users.

## Requiring email confirmation before sign up grants access

If sign up currently gives instant access, that is not a code bug, it
means your Supabase project has "Confirm email" turned off. Fix it in
Supabase, under Authentication, then Providers, then Email (the exact
location shifts slightly between dashboard versions, look for a
"Confirm email" toggle), and turn it on.

The code now handles both cases correctly either way: `signUp` is
checked for whether it actually returned a session. If your project
requires confirmation, no session comes back yet, and the user is sent
to `/auth/check-email` to wait for the confirmation link instead of
being shown as signed in. If confirmation is off, they proceed straight
to capture as before. Enabling that Supabase setting is what actually
changes the behavior you are asking for, this code change makes the app
respond correctly to whichever way that setting is configured.

## Password reset

`/auth` now has a "Forgot your password?" link, leading to
`/auth/reset-password` where a user requests a reset email, and
`/auth/update-password`, where the link in that email lands and a new
password can be set. The reset request always shows the same confirmation
regardless of whether the email exists, so this cannot be used to check
which addresses have an account.

One setup step this depends on: in your Supabase project, under
Authentication, Settings, confirm the **Site URL** is set to your actual
production domain (the `https://your-project.vercel.app` URL, or your
custom domain if you have one). If Site URL is still set to
`localhost:3000`, the reset link Supabase emails out will point at
localhost and fail for anyone testing on the live site. This same
setting is also the most common cause of session related weirdness in
general, see the note below.

## If sign in is not persisting

If users are getting signed out unexpectedly, or a session does not
survive a refresh, the code in `lib/supabase/middleware.ts` follows
Supabase's documented pattern exactly, so before assuming it's a bug,
check these first, in order of how often this actually turns out to be
the cause:

1. **Site URL in Supabase, Authentication, Settings.** This needs to
   match your actual deployed domain exactly, protocol included. A
   mismatch here causes cookie and redirect problems that look exactly
   like "randomly signed out."
2. **Testing across two different domains.** If you have both a
   `*.vercel.app` URL and a custom domain live at the same time,
   cookies set on one will not be sent on the other. Pick one domain to
   actually use and test against.
3. **Browser privacy settings.** Safari's Intelligent Tracking
   Prevention and Brave's shields can both interfere with how
   Supabase's auth cookies persist, particularly in private or incognito
   windows. Try a normal window in Chrome as a baseline before assuming
   the app itself is broken.
4. **JWT expiry, under Authentication, Settings.** A very short expiry
   combined with any hiccup in the automatic refresh will look like
   users getting logged out more often than expected.

If none of those explain it, the next real step is checking your
browser's developer tools, Application tab, Cookies, for `sb-` prefixed
cookies after signing in, to see whether they are being set at all and
what their expiry looks like.

## Voice capture, error handling

The "Speak your dream instead" button previously failed silently if
anything went wrong, which is very likely what looked like "not
capturing anything" even with the microphone active. It now surfaces a
specific message for the most common real causes: microphone permission
blocked, the browser's speech service unreachable (this genuinely
happens with some privacy focused browsers and extensions even when
microphone access itself was granted, since Chrome's speech recognition
sends audio to a Google service over the network, not just to the
device), and no microphone found. It also now restarts itself
automatically after a brief pause in continuous mode, since ending
silently after a few seconds of silence is a known quirk of the
underlying browser API and was likely part of what looked broken.

If voice capture still does not work after this fix, the most useful
next step is checking exactly which error message now appears, since
that will point at the real cause directly instead of guessing.

## What was intentionally not built

No monetization or paywall logic anywhere, that belongs to a separate
business implementation pass. No direct messaging between users. The
graph is a list, not a rendered visualization, as noted above.

## Admin tools

`/admin` is gated by the `ADMIN_EMAILS` environment variable, a comma
separated allowlist checked against the signed in user's email. There is
no roles table, this is intentionally simple since one ministry team
operates this instance. From `/admin` you can create, edit, and delete
Vault content (including publishing or unpublishing an entry) and create
and edit Circles, including bumping a circle's guidelines version, which
requires every existing member to accept the guidelines again before
posting further.

## Semantic search

The dreams list has a "search by meaning" checkbox alongside the existing
exact word search. This requires the optional `OPENAI_API_KEY` (Anthropic
does not currently offer a public embeddings endpoint, so this uses
OpenAI's text-embedding-3-small instead, a separate key from
`ANTHROPIC_API_KEY`). Embeddings are generated automatically whenever a
dream is created or its narrative is edited, best effort, a missing key
or a failed call never blocks saving the dream itself. Dreams recorded
before this key was configured will not appear in meaning based search
results until their narrative is edited once, since there is no batch
backfill job built for existing dreams. Without the key at all, the
checkbox falls back to exact word search automatically with a note
explaining why.

## Verified

`npm run build` and `npx eslint .` both pass clean across all four
phases plus admin tools, semantic search, voice capture, password
reset, and the sign up confirmation fix, 34 routes total, zero errors
and zero warnings. Nothing has been deployed or connected to a
live database from this environment, since it has no network access to
Supabase, Vercel, the Anthropic API, or the OpenAI API for a live test.
The first real test is running the setup steps above against your own
project.
