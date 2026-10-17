"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dbErrorMessage, failTo } from "@/lib/actions/helpers";

// Posting and sharing require that the member has accepted the circle's
// CURRENT guidelines version. The circle page hides the forms otherwise, but
// a server action can be called directly, so the rule is enforced here too.
async function requireCurrentGuidelines(
  supabase: Awaited<ReturnType<typeof createClient>>,
  circleId: string,
  userId: string
) {
  const [{ data: circle }, { data: membership }] = await Promise.all([
    supabase
      .from("circles")
      .select("guidelines_version")
      .eq("id", circleId)
      .maybeSingle(),
    supabase
      .from("circle_memberships")
      .select("guidelines_accepted_version")
      .eq("circle_id", circleId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (
    !circle ||
    !membership ||
    membership.guidelines_accepted_version !== circle.guidelines_version
  ) {
    redirect(`/circles/${circleId}`);
  }
}

// Joining requires an explicit guidelines acceptance, recorded against the
// circle's current guidelines_version, before any posting is possible.
export async function acceptGuidelinesAndJoin(circleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // The version is read from the database, never taken from the browser, so
  // nobody can record acceptance of a version they were not shown.
  const { data: circle } = await supabase
    .from("circles")
    .select("guidelines_version")
    .eq("id", circleId)
    .maybeSingle();
  if (!circle) redirect("/circles");

  // The service-role client is used for the write because members have no
  // UPDATE policy on circle_memberships (and should not: it would let them
  // edit their own acceptance record from the browser). Without this, a
  // member could never re-accept after the guidelines version was bumped,
  // because the upsert turns into an UPDATE that RLS rejects. The user was
  // authenticated above and the row written is always their own.
  const admin = createAdminClient();
  const { error } = await admin.from("circle_memberships").upsert(
    {
      circle_id: circleId,
      user_id: user.id,
      guidelines_accepted_version: circle.guidelines_version,
    },
    { onConflict: "circle_id,user_id" }
  );

  if (error) {
    failTo(`/circles/${circleId}`, "Could not join the circle. Please try again.");
  }

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

  await requireCurrentGuidelines(supabase, circleId, user.id);

  const { data, error } = await supabase
    .from("shared_dreams")
    .insert({ circle_id: circleId, dream_id: dreamId, shared_by: user.id })
    .select("id")
    .single();

  if (error || !data) {
    failTo(`/circles/${circleId}/share`, dbErrorMessage(error, "Could not share this dream. Please try again."));
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

  const { error } = await supabase
    .from("circle_memberships")
    .delete()
    .eq("circle_id", circleId)
    .eq("user_id", user.id);

  if (error) {
    failTo(`/circles/${circleId}`, dbErrorMessage(error, "Could not leave the circle. Please try again."));
  }

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

  const { error } = await supabase
    .from("shared_dreams")
    .delete()
    .eq("id", sharedDreamId)
    .eq("shared_by", user.id);

  if (error) {
    failTo(
      `/circles/${circleId}/dreams/${sharedDreamId}`,
      dbErrorMessage(error, "Could not unshare this dream. Please try again.")
    );
  }

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
  const here = `/circles/${circleId}/dreams/${sharedDreamId}`;
  if (!body) {
    failTo(here, "Write something before posting.");
  }
  if (responseType !== "question" && responseType !== "observation") {
    failTo(here, "Choose whether this is a question or an observation.");
  }

  await requireCurrentGuidelines(supabase, circleId, user.id);

  const { error } = await supabase.from("circle_responses").insert({
    shared_dream_id: sharedDreamId,
    responder_id: user.id,
    response_type: responseType,
    body,
  });

  if (error) {
    failTo(here, dbErrorMessage(error, "Could not post your response. Please try again."));
  }

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

  const { error } = await supabase
    .from("circle_responses")
    .delete()
    .eq("id", responseId)
    .eq("responder_id", user.id);

  if (error) {
    failTo(
      `/circles/${circleId}/dreams/${sharedDreamId}`,
      dbErrorMessage(error, "Could not remove your response. Please try again.")
    );
  }

  revalidatePath(`/circles/${circleId}/dreams/${sharedDreamId}`);
}
