-- Dream Journal, Phase 4 schema addition: Vault, Circles, formation.

create table vault_content (
  id uuid primary key default gen_random_uuid(),
  category text check (category in ('biblical_dream_library','symbol_library','interpretation_framework','case_studies','scripture_library','prayer_resources','teaching_library')) not null,
  title text not null,
  body text not null,
  scripture_references text[],
  published boolean default false,
  created_at timestamptz default now()
);

create table circles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  facilitator_id uuid references auth.users,
  guidelines_version int not null default 1,
  created_at timestamptz default now()
);

create table circle_memberships (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references circles on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  guidelines_accepted_version int,
  joined_at timestamptz default now(),
  unique (circle_id, user_id)
);

create table shared_dreams (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references circles on delete cascade not null,
  dream_id uuid references dreams not null,
  shared_by uuid references auth.users not null,
  shared_at timestamptz default now()
);

create table circle_responses (
  id uuid primary key default gen_random_uuid(),
  shared_dream_id uuid references shared_dreams on delete cascade not null,
  responder_id uuid references auth.users not null,
  response_type text check (response_type in ('question','observation')) not null,
  body text not null,
  created_at timestamptz default now()
);

-- Vault content is readable by any signed in user once published. Only
-- writable via the Supabase dashboard or a future admin tool, not by users.
alter table vault_content enable row level security;
create policy "vault_content readable when published" on vault_content
  for select using (published = true);

-- Circles are readable by anyone signed in, so people can discover and join
-- them. Membership, sharing, and responses are scoped to members.
alter table circles enable row level security;
create policy "circles readable by any signed in user" on circles
  for select using (auth.uid() is not null);

alter table circle_memberships enable row level security;
create policy "memberships readable by the member" on circle_memberships
  for select using (auth.uid() = user_id);
create policy "users can join a circle" on circle_memberships
  for insert with check (auth.uid() = user_id);

alter table shared_dreams enable row level security;
create policy "shared dreams readable by circle members" on shared_dreams
  for select using (
    exists (
      select 1 from circle_memberships
      where circle_memberships.circle_id = shared_dreams.circle_id
        and circle_memberships.user_id = auth.uid()
    )
  );
create policy "members can share into a circle" on shared_dreams
  for insert with check (
    auth.uid() = shared_by
    and exists (
      select 1 from circle_memberships
      where circle_memberships.circle_id = shared_dreams.circle_id
        and circle_memberships.user_id = auth.uid()
    )
    and exists (
      select 1 from dreams
      where dreams.id = shared_dreams.dream_id
        and dreams.user_id = auth.uid()
    )
  );

alter table circle_responses enable row level security;
create policy "responses readable by circle members" on circle_responses
  for select using (
    exists (
      select 1 from shared_dreams
      join circle_memberships on circle_memberships.circle_id = shared_dreams.circle_id
      where shared_dreams.id = circle_responses.shared_dream_id
        and circle_memberships.user_id = auth.uid()
    )
  );
create policy "members can respond in a circle" on circle_responses
  for insert with check (
    auth.uid() = responder_id
    and exists (
      select 1 from shared_dreams
      join circle_memberships on circle_memberships.circle_id = shared_dreams.circle_id
      where shared_dreams.id = circle_responses.shared_dream_id
        and circle_memberships.user_id = auth.uid()
    )
  );

-- A small amount of real seed content so the Vault is not empty on launch.
insert into vault_content (category, title, body, scripture_references, published) values
(
  'interpretation_framework',
  'Observation before interpretation',
  'Before asking what a dream means, write down exactly what happened, without adding conclusions. Note the people, places, objects, and sequence of events as plainly as you would describe a photograph. Interpretation tends to arrive too quickly and crowd out the details that later turn out to matter. Give the observation stage its own time before moving to what it might mean.',
  array['Genesis 40:8', 'Daniel 2:27-28'],
  true
),
(
  'symbol_library',
  'Water in Scripture',
  'Water appears across Scripture in more than one register: as chaos and judgment in the flood narrative, as cleansing and new life in baptism, as provision in the wilderness, and as the Spirit poured out. There is no single fixed meaning. What water represents in one dream depends on its condition, its movement, and what surrounds it, alongside whatever it has personally come to mean to you across your own dreams.',
  array['Genesis 7:17-24', 'John 3:5', 'Isaiah 44:3', 'John 7:38-39'],
  true
),
(
  'case_studies',
  'How one interpretation changed over a year',
  'A recorded dream was first classified as directional, with a first interpretation attempt noting low confidence and several unresolved questions. Source testing at that stage found little external confirmation. Ten months later, a fulfillment record was added noting a related event, and the interpretation was revised to a second version with higher confidence, the earlier version kept visible in its history rather than replaced. The lesson recorded in the eventual testimony was not about the dream itself, but about the value of waiting rather than concluding early.',
  array['Habakkuk 2:3'],
  true
),
(
  'prayer_resources',
  'A prayer for discernment before sleep',
  'A short prayer asking for a quiet mind, protection from fear based interpretation, and grace to remember accurately what is given, holding the outcome loosely rather than demanding significance from every dream.',
  array['James 1:5', 'Philippians 4:6-7'],
  true
);

insert into circles (title, description) values
('New to dream journaling', 'A starting place for people early in learning to remember, record, and examine their dreams.'),
('Testing and discernment', 'For sharing dreams already interpreted, specifically to practice the source testing framework together.');
