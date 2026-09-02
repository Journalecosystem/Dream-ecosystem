"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
    redirect(`/dreams/${dreamId}/testimony?error=Choose+a+fulfillment+record`);
  }

  const interpretationId = String(formData.get("interpretation_id") ?? "").trim() || null;

  await supabase.from("testimonies").insert({
    user_id: user.id,
    dream_id: dreamId,
    fulfillment_id: fulfillmentId,
    interpretation_id: interpretationId,
    summary: String(formData.get("summary") ?? "").trim() || null,
    similarities: String(formData.get("similarities") ?? "").trim() || null,
    differences: String(formData.get("differences") ?? "").trim() || null,
    lessons_learned: String(formData.get("lessons_learned") ?? "").trim() || null,
  });

  revalidatePath("/testimonies");
  redirect("/testimonies");
}
