"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage, failTo, requireUser } from "@/lib/actions/helpers";
import type { FulfillmentStatus } from "@/types/database";

const VALID_STATUSES: FulfillmentStatus[] = [
  "possible_confirmation",
  "possible_fulfillment",
  "confirmed",
  "unfulfilled",
];

// The user always chooses the status explicitly. Nothing here infers or
// defaults a fulfillment determination on its own.
export async function createFulfillmentRecord(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  await requireUser(supabase);

  const status = String(formData.get("status") ?? "");
  if (!VALID_STATUSES.includes(status as FulfillmentStatus)) {
    failTo(`/dreams/${dreamId}/fulfillment`, "Choose a status.");
  }

  const interpretationId = String(formData.get("interpretation_id") ?? "").trim() || null;

  const { error } = await supabase.from("fulfillment_records").insert({
    dream_id: dreamId,
    interpretation_id: interpretationId,
    event_description: String(formData.get("event_description") ?? "").trim() || null,
    event_date: String(formData.get("event_date") ?? "").trim() || null,
    correspondence_notes: String(formData.get("correspondence_notes") ?? "").trim() || null,
    status,
  });

  if (error) {
    failTo(`/dreams/${dreamId}/fulfillment`, dbErrorMessage(error));
  }

  revalidatePath(`/dreams/${dreamId}`);
  revalidatePath("/timeline");
  redirect(`/dreams/${dreamId}`);
}
