-- Phase 8: stop duplicate rows from double submits.
--
-- Nothing stopped two examination, processing, source testing or personal
-- symbol rows existing for the same dream (or person and symbol). A double
-- click on Save, or a slow connection and a retry, created them. Once a
-- duplicate existed, the page could no longer tell which row to show, so
-- saved work looked missing and the next save added yet another copy.
-- Interpretation version numbers had the same weakness: two saves at once
-- could both become "version 3".
--
-- This migration first cleans up any duplicates that already exist, then adds
-- unique indexes so it cannot happen again. The app now saves with true
-- upserts that rely on these indexes, so RUN THIS BEFORE deploying the code
-- that uses them.
--
-- Cleanup rules:
--   * examinations, processing, source testing, personal symbol meanings:
--     the most recently written row is kept, older duplicates are deleted.
--     (dream_processing has no timestamp, so the physically newest row is
--     kept.) Duplicates created by double submits hold the same content, so
--     nothing meaningful is lost.
--   * interpretations: never deleted, because source testing and fulfillment
--     records can hang off them. Duplicate version numbers are renumbered
--     upward instead.
-- Safe to run more than once.

-- --- Cleanup ----------------------------------------------------------------

delete from dream_examinations
where id in (
  select id from (
    select id,
           row_number() over (
             partition by dream_id
             order by created_at desc nulls last, id desc
           ) as rn
    from dream_examinations
  ) ranked
  where rn > 1
);

delete from dream_processing
where id in (
  select id from (
    select id,
           row_number() over (partition by dream_id order by ctid desc) as rn
    from dream_processing
  ) ranked
  where rn > 1
);

delete from source_testing_responses
where id in (
  select id from (
    select id,
           row_number() over (
             partition by interpretation_id
             order by created_at desc nulls last, id desc
           ) as rn
    from source_testing_responses
  ) ranked
  where rn > 1
);

delete from personal_symbol_meanings
where id in (
  select id from (
    select id,
           row_number() over (
             partition by user_id, symbol
             order by updated_at desc nulls last, id desc
           ) as rn
    from personal_symbol_meanings
  ) ranked
  where rn > 1
);

with ranked as (
  select id, dream_id, version,
         row_number() over (
           partition by dream_id, version
           order by created_at asc nulls last, id asc
         ) as rn
  from dream_interpretations
),
highest as (
  select dream_id, max(version) as top
  from dream_interpretations
  group by dream_id
),
extras as (
  select id, dream_id,
         row_number() over (partition by dream_id order by version, rn) as k
  from ranked
  where rn > 1
)
update dream_interpretations di
set version = highest.top + extras.k
from extras
join highest on highest.dream_id = extras.dream_id
where di.id = extras.id;

-- --- Constraints ------------------------------------------------------------

create unique index if not exists dream_examinations_dream_id_key
  on dream_examinations (dream_id);

create unique index if not exists dream_processing_dream_id_key
  on dream_processing (dream_id);

create unique index if not exists source_testing_responses_interpretation_id_key
  on source_testing_responses (interpretation_id);

create unique index if not exists personal_symbol_meanings_user_symbol_key
  on personal_symbol_meanings (user_id, symbol);

create unique index if not exists dream_interpretations_dream_version_key
  on dream_interpretations (dream_id, version);
