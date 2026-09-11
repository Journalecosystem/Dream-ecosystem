import type { SupabaseClient } from "@supabase/supabase-js";

// A minimal, infrastructure-free notification: it answers one question
// ("did anyone respond to a dream I shared, since I last looked?") without
// push, email, or a background job. last_viewed_by_owner_at on shared_dreams
// is set by markSharedDreamViewed (lib/actions/circles.ts) whenever the
// sharer opens that shared dream. This is intentionally scoped to the
// sharer only, not a full read-receipt system for every circle member.
export async function getUnreadCircleResponseCount(
  // Typed loosely because the generated Database type does not yet cover
  // this join shape; the query itself is narrow and read-only.
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data: shared } = await supabase
    .from("shared_dreams")
    .select("id, last_viewed_by_owner_at")
    .eq("shared_by", userId);

  if (!shared || shared.length === 0) return 0;

  const counts = await Promise.all(
    shared.map(async (s) => {
      const { count } = await supabase
        .from("circle_responses")
        .select("id", { count: "exact", head: true })
        .eq("shared_dream_id", s.id)
        .gt("created_at", s.last_viewed_by_owner_at);
      return count ?? 0;
    })
  );

  return counts.reduce((a, b) => a + b, 0);
}
