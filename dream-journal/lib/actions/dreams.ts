"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createDream(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const narrative = String(formData.get("narrative") ?? "").trim();
  if (!narrative) {
    redirect("/dreams/new?error=Write+something+before+saving");
  }

  const title = String(formData.get("title") ?? "").trim() || null;
  const dreamDate =
    String(formData.get("dream_date") ?? "") || new Date().toISOString().slice(0, 10);
  const emotionalState = String(formData.get("emotional_state") ?? "").trim() || null;
  const clarityRaw = formData.get("clarity_level");
  const confidenceRaw = formData.get("confidence_in_memory");

  const { data, error } = await supabase
    .from("dreams")
    .insert({
      user_id: user.id,
      narrative,
      title,
      dream_date: dreamDate,
      emotional_state: emotionalState,
      clarity_level: clarityRaw ? Number(clarityRaw) : null,
      confidence_in_memory: confidenceRaw ? Number(confidenceRaw) : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/dreams/new?error=${encodeURIComponent(error?.message ?? "Could not save")}`);
  }

  revalidatePath("/dreams");
  redirect(`/dreams/${data.id}`);
}

export async function updateDreamMeta(dreamId: string, formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim() || null;
  const dreamDate = String(formData.get("dream_date") ?? "");
  const dreamType = String(formData.get("dream_type") ?? "").trim() || null;

  await supabase
    .from("dreams")
    .update({ title, dream_date: dreamDate, dream_type: dreamType })
    .eq("id", dreamId);

  revalidatePath(`/dreams/${dreamId}`);
  redirect(`/dreams/${dreamId}`);
}

export async function deleteDream(dreamId: string) {
  const supabase = await createClient();
  await supabase.from("dreams").delete().eq("id", dreamId);
  revalidatePath("/dreams");
  redirect("/dreams");
}

export async function updateNarrative(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  const narrative = String(formData.get("narrative") ?? "").trim();
  if (!narrative) return;

  await supabase.from("dreams").update({ narrative }).eq("id", dreamId);
  revalidatePath(`/dreams/${dreamId}`);
}

export async function updateDreamType(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  const dreamType = String(formData.get("dream_type") ?? "").trim() || null;

  await supabase.from("dreams").update({ dream_type: dreamType }).eq("id", dreamId);
  revalidatePath(`/dreams/${dreamId}`);
}

export async function upsertExamination(dreamId: string, formData: FormData) {
  const supabase = await createClient();

  const sleepPreparation = formData.getAll("sleep_preparation").map(String);
  const lastEngagement = formData.getAll("last_engagement").map(String);
  const sleepQualityRaw = formData.get("sleep_quality");
  const wakingEmotionalState =
    String(formData.get("waking_emotional_state") ?? "").trim() || null;

  const { data: existing } = await supabase
    .from("dream_examinations")
    .select("id")
    .eq("dream_id", dreamId)
    .maybeSingle();

  const payload = {
    dream_id: dreamId,
    sleep_preparation: sleepPreparation,
    last_engagement: lastEngagement,
    sleep_quality: sleepQualityRaw ? Number(sleepQualityRaw) : null,
    was_recurring: formData.get("was_recurring") === "on",
    was_interrupted: formData.get("was_interrupted") === "on",
    waking_emotional_state: wakingEmotionalState,
  };

  if (existing) {
    await supabase.from("dream_examinations").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("dream_examinations").insert(payload);
  }

  revalidatePath(`/dreams/${dreamId}`);
}

export async function upsertProcessing(dreamId: string, formData: FormData) {
  const supabase = await createClient();

  const followUpRaw = String(formData.get("follow_up_actions") ?? "");
  const followUpActions = followUpRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const { data: existing } = await supabase
    .from("dream_processing")
    .select("id")
    .eq("dream_id", dreamId)
    .maybeSingle();

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

  if (existing) {
    await supabase.from("dream_processing").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("dream_processing").insert(payload);
  }

  revalidatePath(`/dreams/${dreamId}`);
}

export async function addPerson(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await supabase.from("dream_people").insert({
    dream_id: dreamId,
    name,
    known_person: formData.get("known_person") === "on",
    relationship_to_dreamer:
      String(formData.get("relationship_to_dreamer") ?? "").trim() || null,
    personal_significance:
      String(formData.get("personal_significance") ?? "").trim() || null,
    appeared_before: formData.get("appeared_before") === "on",
  });

  revalidatePath(`/dreams/${dreamId}`);
}

export async function deletePerson(dreamId: string, personId: string) {
  const supabase = await createClient();
  await supabase.from("dream_people").delete().eq("id", personId);
  revalidatePath(`/dreams/${dreamId}`);
}

export async function addSymbol(dreamId: string, formData: FormData) {
  const supabase = await createClient();
  const value = String(formData.get("value") ?? "").trim();
  if (!value) return;

  await supabase.from("dream_symbols").insert({
    dream_id: dreamId,
    value,
    category: String(formData.get("category") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePath(`/dreams/${dreamId}`);
}

export async function deleteSymbol(dreamId: string, symbolId: string) {
  const supabase = await createClient();
  await supabase.from("dream_symbols").delete().eq("id", symbolId);
  revalidatePath(`/dreams/${dreamId}`);
}
