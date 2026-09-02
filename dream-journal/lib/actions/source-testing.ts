"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const FIELDS = [
  "christ_alignment",
  "scriptural_alignment",
  "character_alignment",
  "fruit",
  "peace_and_wisdom",
  "evidence",
  "personal_context",
  "repetition",
  "confirmation",
  "timing",
  "outcome",
] as const;

// The eleven question framework is answered by the user only. This action
// never receives or writes AI generated content into any of these fields.
export async function upsertSourceTesting(
  dreamId: string,
  interpretationId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("source_testing_responses")
    .select("id")
    .eq("interpretation_id", interpretationId)
    .maybeSingle();

  const payload: Record<string, string | null> = { interpretation_id: interpretationId };
  for (const field of FIELDS) {
    payload[field] = String(formData.get(field) ?? "").trim() || null;
  }

  if (existing) {
    await supabase.from("source_testing_responses").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("source_testing_responses").insert(payload);
  }

  revalidatePath(`/dreams/${dreamId}`);
  revalidatePath(`/dreams/${dreamId}/source-testing`);
}
