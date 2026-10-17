"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage, failTo, requireUser } from "@/lib/actions/helpers";

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
  await requireUser(supabase);

  const payload: Record<string, string | null> = { interpretation_id: interpretationId };
  for (const field of FIELDS) {
    payload[field] = String(formData.get(field) ?? "").trim() || null;
  }

  // One response per interpretation (unique index from migration 0008).
  const { error } = await supabase
    .from("source_testing_responses")
    .upsert(payload, { onConflict: "interpretation_id" });

  if (error) {
    failTo(`/dreams/${dreamId}`, dbErrorMessage(error), { open: "source-testing" });
  }

  revalidatePath(`/dreams/${dreamId}`);
  revalidatePath(`/dreams/${dreamId}/source-testing`);
}
