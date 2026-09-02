-- Dream Journal, Phase 3 schema addition.
-- fulfillment_records already exists from Phase 1. This adds testimonies.

create table testimonies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  dream_id uuid references dreams not null,
  interpretation_id uuid references dream_interpretations,
  fulfillment_id uuid references fulfillment_records,
  summary text,
  similarities text,
  differences text,
  lessons_learned text,
  is_private boolean default true,
  created_at timestamptz default now()
);

alter table testimonies enable row level security;

create policy "testimonies owned by user" on testimonies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
