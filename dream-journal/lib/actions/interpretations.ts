"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage, failTo, requireUser } from "@/lib/actions/helpers";

// Interpretations are always versioned, never overwritten, so a user's
// prior understanding of a dream stays visible even after it changes.
export async function createInterpretation(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  await requireUser(supabase);

  const { data: latest, error: latestError } = await supabase
    .from("dream_interpretations")
    .select("version")
    .eq("dream_id", dreamId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    failTo(`/dreams/${dreamId}/interpret`, dbErrorMessage(latestError));
  }

  const nextVersion = (latest?.version ?? 0) + 1;
  const confidenceRaw = formData.get("confidence_level");

  const { error } = await supabase.from("dream_interpretations").insert({
    dream_id: dreamId,
    version: nextVersion,
    possible_meaning: String(formData.get("possible_meaning") ?? "").trim() || null,
    confidence_level: confidenceRaw ? Number(confidenceRaw) : null,
    evidence_for: String(formData.get("evidence_for") ?? "").trim() || null,
    evidence_against: String(formData.get("evidence_against") ?? "").trim() || null,
    unresolved_questions:
      String(formData.get("unresolved_questions") ?? "").trim() || null,
  });

  if (error) {
    // Two saves at once would both compute the same next version. The unique
    // index from migration 0008 stops the second, and this explains why.
    const message =
      error.code === "23505"
        ? "Another version was saved at the same moment. Reload the page and save again."
        : dbErrorMessage(error);
    failTo(`/dreams/${dreamId}/interpret`, message);
  }

  revalidatePath(`/dreams/${dreamId}`);
  redirect(`/dreams/${dreamId}`);
}
