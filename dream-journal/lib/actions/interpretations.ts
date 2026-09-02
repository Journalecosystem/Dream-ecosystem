"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Interpretations are always versioned, never overwritten, so a user's
// prior understanding of a dream stays visible even after it changes.
export async function createInterpretation(dreamId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: latest } = await supabase
    .from("dream_interpretations")
    .select("version")
    .eq("dream_id", dreamId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version ?? 0) + 1;

  const confidenceRaw = formData.get("confidence_level");

  await supabase.from("dream_interpretations").insert({
    dream_id: dreamId,
    version: nextVersion,
    possible_meaning: String(formData.get("possible_meaning") ?? "").trim() || null,
    confidence_level: confidenceRaw ? Number(confidenceRaw) : null,
    evidence_for: String(formData.get("evidence_for") ?? "").trim() || null,
    evidence_against: String(formData.get("evidence_against") ?? "").trim() || null,
    unresolved_questions:
      String(formData.get("unresolved_questions") ?? "").trim() || null,
  });

  revalidatePath(`/dreams/${dreamId}`);
  redirect(`/dreams/${dreamId}`);
}
