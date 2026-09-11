"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Joining requires an explicit guidelines acceptance, recorded against the
// circle's current guidelines_version, before any posting is possible.
export async function acceptGuidelinesAndJoin(circleId: string, guidelinesVersion: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  await supabase.from("circle_memberships").upsert(
    {
      circle_id: circleId,
      user_id: user.id,
      guidelines_accepted_version: guidelinesVersion,
    },
    { onConflict: "circle_id,user_id" }
  );

  revalidatePath(`/circles/${circleId}`);
}

// Sharing is always a separate, explicit action reachable only from the
// user's own dream. A dream is never shared automatically.
export async function shareDreamToCircle(circleId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const dreamId = String(formData.get("dream_id") ?? "").trim();
  if (!dreamId) return;

  const { data, error } = await supabase
    .from("shared_dreams")
    .insert({ circle_id: circleId, dream_id: dreamId, shared_by: user.id })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/circles/${circleId}/share?error=${encodeURIComponent(error?.message ?? "Could not share")}`);
  }

  revalidatePath(`/circles/${circleId}`);
  redirect(`/circles/${circleId}/dreams/${data.id}`);
}

// Leaving is always the member's own choice, removing only their own
// membership row. RLS also allows a circle's facilitator to remove other
// members; that is handled separately in lib/actions/circle-moderation.ts
// so the two code paths cannot be confused with each other.
export async function leaveCircle(circleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  await supabase
    .from("circle_memberships")
    .delete()
    .eq("circle_id", circleId)
    .eq("user_id", user.id);

  revalidatePath(`/circles/${circleId}`);
  revalidatePath("/circles");
  redirect("/circles");
}

// Unsharing removes the shared_dreams row (and, via cascade, its responses).
// The underlying dream itself is never touched, only its visibility to the
// circle. Only the original sharer can do this from here; a facilitator's
// equivalent lives in lib/actions/circle-moderation.ts.
export async function unshareDream(circleId: string, sharedDreamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  await supabase
    .from("shared_dreams")
    .delete()
    .eq("id", sharedDreamId)
    .eq("shared_by", user.id);

  revalidatePath(`/circles/${circleId}`);
  redirect(`/circles/${circleId}`);
}

// Called when the person who shared a dream opens it, so unread response
// counts (see lib/notifications.ts) reset for that shared dream.
export async function markSharedDreamViewed(sharedDreamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("shared_dreams")
    .update({ last_viewed_by_owner_at: new Date().toISOString() })
    .eq("id", sharedDreamId)
    .eq("shared_by", user.id);
}

// response_type only ever accepts question or observation, structurally
// preventing a member from posting a verdict over someone else's dream.
export async function postCircleResponse(
  circleId: string,
  sharedDreamId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const responseType = String(formData.get("response_type") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body || (responseType !== "question" && responseType !== "observation")) return;

  await supabase.from("circle_responses").insert({
    shared_dream_id: sharedDreamId,
    responder_id: user.id,
    response_type: responseType,
    body,
  });

  revalidatePath(`/circles/${circleId}/dreams/${sharedDreamId}`);
}

export async function deleteOwnResponse(
  circleId: string,
  sharedDreamId: string,
  responseId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  await supabase
    .from("circle_responses")
    .delete()
    .eq("id", responseId)
    .eq("responder_id", user.id);

  revalidatePath(`/circles/${circleId}/dreams/${sharedDreamId}`);
}
