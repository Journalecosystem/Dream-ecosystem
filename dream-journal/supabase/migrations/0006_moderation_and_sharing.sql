-- Phase 6: closes gaps found in a code audit.
--
-- 1. Circles had no way to leave, unshare, or moderate. facilitator_id
--    existed on the circles table but nothing ever read or wrote it, and
--    there was no delete policy on memberships/shares/responses at all, so
--    even a user's own membership or share could not be removed from the UI.
-- 2. testimonies.is_private existed but nothing ever set or read it, and
--    there was no way to share a single testimony with someone (a mentor,
--    a pastor) outside a Circle. This adds a share token used only via a
--    direct, server-side, service-role lookup (see app/t/[token]) rather
--    than a public RLS policy, so non-private testimonies are still never
--    listable or enumerable by anyone who doesn't already have the link.
-- 3. shared_dreams had no way to know whether the person who shared a
--    dream had seen the responses to it.

-- --- Leaving a circle / unsharing a dream / moderation --------------------

-- A member can remove their own membership (leave). A circle's facilitator
-- can also remove another member's membership (moderation).
create policy "members can leave a circle" on circle_memberships
  for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from circles
      where circles.id = circle_memberships.circle_id
        and circles.facilitator_id = auth.uid()
    )
  );

-- The person who shared a dream can unshare it. A circle's facilitator can
-- also remove a share from their circle (moderation).
create policy "sharer or facilitator can remove a shared dream" on shared_dreams
  for delete using (
    auth.uid() = shared_by
    or exists (
      select 1 from circles
      where circles.id = shared_dreams.circle_id
        and circles.facilitator_id = auth.uid()
    )
  );

-- A responder can remove their own response. A circle's facilitator can
-- also remove any response in their circle (moderation).
create policy "responder or facilitator can remove a response" on circle_responses
  for delete using (
    auth.uid() = responder_id
    or exists (
      select 1 from shared_dreams
      join circles on circles.id = shared_dreams.circle_id
      where shared_dreams.id = circle_responses.shared_dream_id
        and circles.facilitator_id = auth.uid()
    )
  );

-- --- Unread tracking for shared dreams -------------------------------------

alter table shared_dreams
  add column last_viewed_by_owner_at timestamptz not null default now();

comment on column shared_dreams.last_viewed_by_owner_at is
  'Updated whenever the person who shared this dream (shared_by) opens it. Used to badge unread responses; not a per-member read receipt.';

-- --- Testimony share links --------------------------------------------------

alter table testimonies
  add column share_token uuid not null default gen_random_uuid() unique;

comment on column testimonies.share_token is
  'Opaque token for the read-only /t/[token] page. Only usable when is_private = false. Looked up with the service-role client, scoped to is_private = false in application code — never exposed via a public RLS policy, so testimonies remain unlistable without the exact link.';
