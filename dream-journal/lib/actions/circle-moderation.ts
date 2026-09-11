"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Facilitator moderation is separate from the global admin allowlist
// (lib/auth/admin.ts): a facilitator is a specific user assigned per circle
// via circles.facilitator_id, not necessarily a ministry team member. This
// uses the service-role client because a facilitator otherwise has no RLS
// visibility into other members' rows (regular members can only see their
// own membership row), and because moderation deletes must be reliable
// regardless of RLS edge cases.
async function requireFacilitator(circleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const admin = createAdminClient();
  const { data: circle } = await admin
    .from("circles")
    .select("facilitator_id")
    .eq("id", circleId)
    .single();

  if (!circle || circle.facilitator_id !== user.id) {
    redirect(`/circles/${circleId}`);
  }

  return { user, admin };
}

// Fetches members with their email for the facilitator's management view.
// Regular circle pages never call this — only used when the current user is
// already confirmed as the facilitator.
export async function listMembersForFacilitator(circleId: string) {
  const { admin } = await requireFacilitator(circleId);

  const { data: memberships } = await admin
    .from("circle_memberships")
    .select("id, user_id, joined_at")
    .eq("circle_id", circleId)
    .order("joined_at", { ascending: true });

  const members = await Promise.all(
    (memberships ?? []).map(async (m) => {
      const { data } = await admin.auth.admin.getUserById(m.user_id);
      return {
        membershipId: m.id,
        userId: m.user_id,
        email: data.user?.email ?? "unknown",
        joinedAt: m.joined_at,
      };
    })
  );

  return members;
}

export async function removeMember(circleId: string, membershipId: string) {
  const { admin } = await requireFacilitator(circleId);

  await admin.from("circle_memberships").delete().eq("id", membershipId);

  revalidatePath(`/circles/${circleId}`);
}

export async function removeSharedDreamAsFacilitator(circleId: string, sharedDreamId: string) {
  const { admin } = await requireFacilitator(circleId);

  await admin.from("shared_dreams").delete().eq("id", sharedDreamId);

  revalidatePath(`/circles/${circleId}`);
  redirect(`/circles/${circleId}`);
}

export async function removeResponseAsFacilitator(
  circleId: string,
  sharedDreamId: string,
  responseId: string
) {
  const { admin } = await requireFacilitator(circleId);

  await admin.from("circle_responses").delete().eq("id", responseId);

  revalidatePath(`/circles/${circleId}/dreams/${sharedDreamId}`);
}
