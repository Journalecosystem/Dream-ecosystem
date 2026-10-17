"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage, failTo } from "@/lib/actions/helpers";

// A testimony is only ever created from an existing dream and an existing
// fulfillment record, never as a standalone claim.
export async function createTestimony(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const fulfillmentId = String(formData.get("fulfillment_id") ?? "").trim();
  if (!fulfillmentId) {
    failTo(`/dreams/${dreamId}/testimony`, "Choose a fulfillment record.");
  }

  const interpretationId = String(formData.get("interpretation_id") ?? "").trim() || null;
  // Defaults to private: a testimony only becomes shareable when the user
  // explicitly unchecks the box, never by default.
  const isPrivate = formData.get("is_private") === "on";

  const { error } = await supabase.from("testimonies").insert({
    user_id: user.id,
    dream_id: dreamId,
    fulfillment_id: fulfillmentId,
    interpretation_id: interpretationId,
    summary: String(formData.get("summary") ?? "").trim() || null,
    similarities: String(formData.get("similarities") ?? "").trim() || null,
    differences: String(formData.get("differences") ?? "").trim() || null,
    lessons_learned: String(formData.get("lessons_learned") ?? "").trim() || null,
    is_private: isPrivate,
  });

  if (error) {
    failTo(`/dreams/${dreamId}/testimony`, dbErrorMessage(error));
  }

  revalidatePath("/testimonies");
  redirect("/testimonies");
}

// Flips a testimony's privacy. share_token already exists on every row
// (set at insert time by the database default), so making a testimony
// public never requires generating a new token here — it only changes
// whether app/t/[token] is willing to serve it.
export async function setTestimonyPrivacy(testimonyId: string, isPrivate: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { error } = await supabase
    .from("testimonies")
    .update({ is_private: isPrivate })
    .eq("id", testimonyId)
    .eq("user_id", user.id);

  if (error) {
    failTo("/testimonies", dbErrorMessage(error));
  }

  revalidatePath("/testimonies");
}

// Invalidates any link already handed out, without changing the private/
// public setting itself. Useful if a link was shared with the wrong person.
export async function rotateTestimonyShareToken(testimonyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { error } = await supabase
    .from("testimonies")
    .update({ share_token: crypto.randomUUID() })
    .eq("id", testimonyId)
    .eq("user_id", user.id);

  if (error) {
    failTo("/testimonies", dbErrorMessage(error));
  }

  revalidatePath("/testimonies");
}
