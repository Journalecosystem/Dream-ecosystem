"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { dbErrorMessage, failTo, requireUser } from "@/lib/actions/helpers";

export async function createDream(formData: FormData) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const narrative = String(formData.get("narrative") ?? "").trim();
  if (!narrative) {
    failTo("/dreams/new", "Write something before saving.");
  }

  const title = String(formData.get("title") ?? "").trim() || null;
  const dreamDate =
    String(formData.get("dream_date") ?? "") || new Date().toISOString().slice(0, 10);
  const emotionalState = String(formData.get("emotional_state") ?? "").trim() || null;
  const clarityRaw = formData.get("clarity_level");
  const confidenceRaw = formData.get("confidence_in_memory");
  const captureMethodRaw = String(formData.get("capture_method") ?? "text");
  const captureMethod = ["text", "voice", "handwritten"].includes(captureMethodRaw)
    ? captureMethodRaw
    : "text";

  const { data, error } = await supabase
    .from("dreams")
    .insert({
      user_id: user.id,
      narrative,
      title,
      dream_date: dreamDate,
      emotional_state: emotionalState,
      capture_method: captureMethod,
      clarity_level: clarityRaw ? Number(clarityRaw) : null,
      confidence_in_memory: confidenceRaw ? Number(confidenceRaw) : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    failTo("/dreams/new", dbErrorMessage(error, "Could not save your dream. Please try again."));
  }

  // Best effort. A missing key or a failed call never blocks saving the
  // dream itself, since capture speed matters more than search coverage.
  const embedding = await generateEmbedding(narrative);
  if (embedding) {
    await supabase.from("dreams").update({ embedding }).eq("id", data.id);
  }

  revalidatePath("/dreams");
  redirect(`/dreams/${data.id}`);
}

export async function updateDreamMeta(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const title = String(formData.get("title") ?? "").trim() || null;
  const dreamDate = String(formData.get("dream_date") ?? "").trim();
  const dreamType = String(formData.get("dream_type") ?? "").trim() || null;

  // An empty date used to be sent to the database as "", which it rejects,
  // and the failure was swallowed. Keep the existing date instead.
  const changes: Record<string, string | null> = { title, dream_type: dreamType };
  if (dreamDate) changes.dream_date = dreamDate;

  // RLS already scopes this to the owning user; the explicit .eq below is
  // deliberate defense in depth so a mistaken future RLS change fails safe
  // (updates zero rows) rather than silently opening cross-user writes.
  const { error } = await supabase
    .from("dreams")
    .update(changes)
    .eq("id", dreamId)
    .eq("user_id", user.id);

  if (error) {
    failTo(`/dreams/${dreamId}/edit`, dbErrorMessage(error));
  }

  revalidatePath(`/dreams/${dreamId}`);
  redirect(`/dreams/${dreamId}`);
}

export async function deleteDream(dreamId: string) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const { error } = await supabase
    .from("dreams")
    .delete()
    .eq("id", dreamId)
    .eq("user_id", user.id);

  if (error) {
    failTo(`/dreams/${dreamId}/edit`, dbErrorMessage(error, "Could not delete this dream. Please try again."));
  }

  revalidatePath("/dreams");
  redirect("/dreams");
}

export async function updateNarrative(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const narrative = String(formData.get("narrative") ?? "").trim();
  if (!narrative) {
    failTo(`/dreams/${dreamId}`, "A dream cannot be saved empty. Your previous text was kept.");
  }

  const { error } = await supabase
    .from("dreams")
    .update({ narrative })
    .eq("id", dreamId)
    .eq("user_id", user.id);

  if (error) {
    failTo(`/dreams/${dreamId}`, dbErrorMessage(error));
  }

  const embedding = await generateEmbedding(narrative);
  if (embedding) {
    await supabase
      .from("dreams")
      .update({ embedding })
      .eq("id", dreamId)
      .eq("user_id", user.id);
  }

  revalidatePath(`/dreams/${dreamId}`);
}

export async function updateDreamType(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const dreamType = String(formData.get("dream_type") ?? "").trim() || null;

  const { error } = await supabase
    .from("dreams")
    .update({ dream_type: dreamType })
    .eq("id", dreamId)
    .eq("user_id", user.id);

  if (error) {
    failTo(`/dreams/${dreamId}`, dbErrorMessage(error), { open: "dream-type" });
  }

  revalidatePath(`/dreams/${dreamId}`);
}

export async function upsertExamination(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  await requireUser(supabase);

  const sleepQualityRaw = formData.get("sleep_quality");

  const payload = {
    dream_id: dreamId,
    sleep_preparation: formData.getAll("sleep_preparation").map(String),
    last_engagement: formData.getAll("last_engagement").map(String),
    sleep_quality: sleepQualityRaw ? Number(sleepQualityRaw) : null,
    was_recurring: formData.get("was_recurring") === "on",
    was_interrupted: formData.get("was_interrupted") === "on",
    waking_emotional_state:
      String(formData.get("waking_emotional_state") ?? "").trim() || null,
  };

  // One examination per dream (unique index added in migration 0008), so
  // saving twice, or double clicking Save, updates the same row.
  const { error } = await supabase
    .from("dream_examinations")
    .upsert(payload, { onConflict: "dream_id" });

  if (error) {
    failTo(`/dreams/${dreamId}`, dbErrorMessage(error), { open: "examination" });
  }

  revalidatePath(`/dreams/${dreamId}`);
}

export async function upsertProcessing(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  await requireUser(supabase);

  const followUpActions = String(formData.get("follow_up_actions") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const payload = {
    dream_id: dreamId,
    unique_impressions: String(formData.get("unique_impressions") ?? "").trim() || null,
    scriptures_that_come_to_mind:
      String(formData.get("scriptures_that_come_to_mind") ?? "").trim() || null,
    personal_experiences_connected:
      String(formData.get("personal_experiences_connected") ?? "").trim() || null,
    current_circumstances_relevant:
      String(formData.get("current_circumstances_relevant") ?? "").trim() || null,
    follow_up_actions: followUpActions,
  };

  const { error } = await supabase
    .from("dream_processing")
    .upsert(payload, { onConflict: "dream_id" });

  if (error) {
    failTo(`/dreams/${dreamId}`, dbErrorMessage(error), { open: "processing" });
  }

  revalidatePath(`/dreams/${dreamId}`);
}

export async function addPerson(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  await requireUser(supabase);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    failTo(`/dreams/${dreamId}`, "Enter a name before adding a person.", { open: "people" });
  }

  const { error } = await supabase.from("dream_people").insert({
    dream_id: dreamId,
    name,
    known_person: formData.get("known_person") === "on",
    relationship_to_dreamer:
      String(formData.get("relationship_to_dreamer") ?? "").trim() || null,
    personal_significance:
      String(formData.get("personal_significance") ?? "").trim() || null,
    appeared_before: formData.get("appeared_before") === "on",
  });

  if (error) {
    failTo(`/dreams/${dreamId}`, dbErrorMessage(error), { open: "people" });
  }

  revalidatePath(`/dreams/${dreamId}`);
}

export async function deletePerson(dreamId: string, personId: string) {
  const supabase = await createClient();
  await requireUser(supabase);

  const { error } = await supabase
    .from("dream_people")
    .delete()
    .eq("id", personId)
    .eq("dream_id", dreamId);

  if (error) {
    failTo(`/dreams/${dreamId}`, dbErrorMessage(error), { open: "people" });
  }

  revalidatePath(`/dreams/${dreamId}`);
}

export async function addSymbol(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  await requireUser(supabase);

  const value = String(formData.get("value") ?? "").trim();
  if (!value) {
    failTo(`/dreams/${dreamId}`, "Enter a symbol or detail before adding it.", { open: "symbols" });
  }

  const { error } = await supabase.from("dream_symbols").insert({
    dream_id: dreamId,
    value,
    category: String(formData.get("category") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) {
    failTo(`/dreams/${dreamId}`, dbErrorMessage(error), { open: "symbols" });
  }

  revalidatePath(`/dreams/${dreamId}`);
}

export async function deleteSymbol(dreamId: string, symbolId: string) {
  const supabase = await createClient();
  await requireUser(supabase);

  const { error } = await supabase
    .from("dream_symbols")
    .delete()
    .eq("id", symbolId)
    .eq("dream_id", dreamId);

  if (error) {
    failTo(`/dreams/${dreamId}`, dbErrorMessage(error), { open: "symbols" });
  }

  revalidatePath(`/dreams/${dreamId}`);
}
