# Dream Journal, Phase 1

A quiet place to capture, examine, and process dreams, built to the Phase 1
scope of the Dream Journal ecosystem: capture, examination, processing,
private account, and nothing more. Interpretation, source testing, timeline,
Vault, and Circles are intentionally out of scope for this phase.

## Stack

Next.js 15, App Router, TypeScript, Tailwind CSS, Supabase (Postgres, Auth),
self-hosted Fraunces and Inter fonts (no external font fetch at build time).

## Setup

1. Create a new Supabase project at supabase.com.
2. In the Supabase SQL editor, run the contents of
   `supabase/migrations/0001_init.sql`. This creates all tables (including
   several with no UI yet, reserved for later phases) and their row level
   security policies.
3. Copy `.env.local.example` to `.env.local` and fill in the three values
   from your Supabase project's Settings, API page:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — used only by the account deletion route,
     never exposed to the browser. Keep this out of version control.
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

## What is deliberately not built yet

Interpretation, source testing, personal symbol memory, AI features,
fulfillment tracking, the timeline, the dream graph, the Vault, and Circles
all belong to later phases. Their schema exists in the migration already
(`dream_interpretations`, `fulfillment_records`, `personal_symbol_meanings`)
so those phases need no destructive migration, but no screen touches them
yet. Do not build ahead of the current phase.

## Verified

`npm run build` and `npx eslint .` both pass clean as of this handoff.
Nothing has been deployed or connected to a live database, since this
environment has no network access to Supabase or Vercel. The first real
test is running the setup steps above against your own project.
