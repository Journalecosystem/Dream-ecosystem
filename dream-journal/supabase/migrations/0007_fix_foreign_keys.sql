-- Phase 7: fixes found in a code audit.
--
-- Several foreign keys had no ON DELETE behaviour, which in Postgres means
-- "refuse to delete the parent while a child exists". In practice:
--
--   * Deleting a dream that had been shared to a Circle, or that had a
--     testimony, failed (and the app swallowed the error, so the dream
--     appeared to refuse to delete with no explanation).
--   * "Delete my account" failed for anyone who had ever shared a dream,
--     posted a response in a Circle, or been made a facilitator.
--
-- Constraint names below are the ones Postgres generates for inline
-- "references" clauses (<table>_<column>_fkey). Safe to run more than once.

-- A shared dream goes away with its dream, or with the person who shared it.
alter table shared_dreams
  drop constraint if exists shared_dreams_dream_id_fkey,
  add constraint shared_dreams_dream_id_fkey
    foreign key (dream_id) references dreams (id) on delete cascade;

alter table shared_dreams
  drop constraint if exists shared_dreams_shared_by_fkey,
  add constraint shared_dreams_shared_by_fkey
    foreign key (shared_by) references auth.users (id) on delete cascade;

-- Responses go away with the person who wrote them.
alter table circle_responses
  drop constraint if exists circle_responses_responder_id_fkey,
  add constraint circle_responses_responder_id_fkey
    foreign key (responder_id) references auth.users (id) on delete cascade;

-- A circle survives losing its facilitator; it just has none until an admin
-- assigns another.
alter table circles
  drop constraint if exists circles_facilitator_id_fkey,
  add constraint circles_facilitator_id_fkey
    foreign key (facilitator_id) references auth.users (id) on delete set null;

-- A testimony goes away with its dream. Losing only the fulfillment record
-- or interpretation it pointed at should not delete the testimony itself.
alter table testimonies
  drop constraint if exists testimonies_dream_id_fkey,
  add constraint testimonies_dream_id_fkey
    foreign key (dream_id) references dreams (id) on delete cascade;

alter table testimonies
  drop constraint if exists testimonies_fulfillment_id_fkey,
  add constraint testimonies_fulfillment_id_fkey
    foreign key (fulfillment_id) references fulfillment_records (id) on delete set null;

alter table testimonies
  drop constraint if exists testimonies_interpretation_id_fkey,
  add constraint testimonies_interpretation_id_fkey
    foreign key (interpretation_id) references dream_interpretations (id) on delete set null;
