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
