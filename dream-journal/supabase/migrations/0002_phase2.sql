-- Dream Journal, Phase 2 schema addition.
-- dream_interpretations and personal_symbol_meanings already exist from
-- Phase 1. This adds the one table Phase 2 needs that Phase 1 did not
-- anticipate with its own table: source testing responses.

create table source_testing_responses (
  id uuid primary key default gen_random_uuid(),
  interpretation_id uuid references dream_interpretations on delete cascade not null,
  christ_alignment text,
  scriptural_alignment text,
  character_alignment text,
  fruit text,
  peace_and_wisdom text,
  evidence text,
  personal_context text,
  repetition text,
  confirmation text,
  timing text,
  outcome text,
  created_at timestamptz default now()
);

alter table source_testing_responses enable row level security;

create policy "source_testing_responses via owning interpretation" on source_testing_responses
  for all using (
    exists (
      select 1
      from dream_interpretations
      join dreams on dreams.id = dream_interpretations.dream_id
      where dream_interpretations.id = source_testing_responses.interpretation_id
        and dreams.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from dream_interpretations
      join dreams on dreams.id = dream_interpretations.dream_id
      where dream_interpretations.id = source_testing_responses.interpretation_id
        and dreams.user_id = auth.uid()
    )
  );
