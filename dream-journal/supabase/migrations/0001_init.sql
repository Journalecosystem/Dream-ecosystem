-- Dream Journal, Phase 1 schema.
-- Tables beyond dreams and dream_examinations have no UI yet in Phase 1
-- but are created now so later phases need no destructive migration.

create table dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text,
  narrative text not null,
  dream_date date not null,
  capture_method text check (capture_method in ('text','voice','handwritten')) default 'text',
  emotional_state text,
  clarity_level int check (clarity_level between 1 and 5),
  confidence_in_memory int check (confidence_in_memory between 1 and 5),
  dream_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table dream_examinations (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid references dreams on delete cascade not null,
  sleep_preparation text[],
  last_engagement text[],
  sleep_quality int check (sleep_quality between 1 and 5),
  was_recurring boolean default false,
  was_interrupted boolean default false,
  waking_emotional_state text,
  created_at timestamptz default now()
);

create table dream_people (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid references dreams on delete cascade not null,
  name text,
  known_person boolean,
  relationship_to_dreamer text,
  personal_significance text,
  appeared_before boolean default false
);

create table dream_symbols (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid references dreams on delete cascade not null,
  category text,
  value text not null,
  notes text
);

create table dream_processing (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid references dreams on delete cascade not null,
  unique_impressions text,
  scriptures_that_come_to_mind text,
  personal_experiences_connected text,
  current_circumstances_relevant text,
  follow_up_actions text[]
);

create table dream_interpretations (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid references dreams on delete cascade not null,
  version int not null default 1,
  possible_meaning text,
  confidence_level int check (confidence_level between 1 and 5),
  evidence_for text,
  evidence_against text,
  unresolved_questions text,
  created_at timestamptz default now()
);

create table fulfillment_records (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid references dreams on delete cascade not null,
  interpretation_id uuid references dream_interpretations,
  event_description text,
  event_date date,
  correspondence_notes text,
  status text check (status in ('possible_confirmation','possible_fulfillment','confirmed','unfulfilled')),
  created_at timestamptz default now()
);

create table personal_symbol_meanings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  symbol text not null,
  personal_meaning text,
  updated_at timestamptz default now()
);

-- Row level security: every table restricted to its owning user,
-- either directly via user_id or indirectly via the owning dream.

alter table dreams enable row level security;
alter table dream_examinations enable row level security;
alter table dream_people enable row level security;
alter table dream_symbols enable row level security;
alter table dream_processing enable row level security;
alter table dream_interpretations enable row level security;
alter table fulfillment_records enable row level security;
alter table personal_symbol_meanings enable row level security;

create policy "dreams owned by user" on dreams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "dream_examinations via owning dream" on dream_examinations
  for all using (
    exists (select 1 from dreams where dreams.id = dream_examinations.dream_id and dreams.user_id = auth.uid())
  ) with check (
    exists (select 1 from dreams where dreams.id = dream_examinations.dream_id and dreams.user_id = auth.uid())
  );

create policy "dream_people via owning dream" on dream_people
  for all using (
    exists (select 1 from dreams where dreams.id = dream_people.dream_id and dreams.user_id = auth.uid())
  ) with check (
    exists (select 1 from dreams where dreams.id = dream_people.dream_id and dreams.user_id = auth.uid())
  );

create policy "dream_symbols via owning dream" on dream_symbols
  for all using (
    exists (select 1 from dreams where dreams.id = dream_symbols.dream_id and dreams.user_id = auth.uid())
  ) with check (
    exists (select 1 from dreams where dreams.id = dream_symbols.dream_id and dreams.user_id = auth.uid())
  );

create policy "dream_processing via owning dream" on dream_processing
  for all using (
    exists (select 1 from dreams where dreams.id = dream_processing.dream_id and dreams.user_id = auth.uid())
  ) with check (
    exists (select 1 from dreams where dreams.id = dream_processing.dream_id and dreams.user_id = auth.uid())
  );

create policy "dream_interpretations via owning dream" on dream_interpretations
  for all using (
    exists (select 1 from dreams where dreams.id = dream_interpretations.dream_id and dreams.user_id = auth.uid())
  ) with check (
    exists (select 1 from dreams where dreams.id = dream_interpretations.dream_id and dreams.user_id = auth.uid())
  );

create policy "fulfillment_records via owning dream" on fulfillment_records
  for all using (
    exists (select 1 from dreams where dreams.id = fulfillment_records.dream_id and dreams.user_id = auth.uid())
  ) with check (
    exists (select 1 from dreams where dreams.id = fulfillment_records.dream_id and dreams.user_id = auth.uid())
  );

create policy "personal_symbol_meanings owned by user" on personal_symbol_meanings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
