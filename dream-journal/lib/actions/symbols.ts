"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// A personal symbol meaning belongs to the user, never to a universal
// dictionary. This never gets overwritten by reference content elsewhere.
export async function upsertPersonalSymbolMeaning(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const symbol = String(formData.get("symbol") ?? "").trim();
  if (!symbol) return;

  const personalMeaning = String(formData.get("personal_meaning") ?? "").trim() || null;

  const { data: existing } = await supabase
    .from("personal_symbol_meanings")
    .select("id")
    .eq("user_id", user.id)
    .eq("symbol", symbol)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("personal_symbol_meanings")
      .update({ personal_meaning: personalMeaning, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("personal_symbol_meanings")
      .insert({ user_id: user.id, symbol, personal_meaning: personalMeaning });
  }

  revalidatePath("/symbols");
}

export async function deletePersonalSymbolMeaning(meaningId: string) {
  const supabase = await createClient();
  await supabase.from("personal_symbol_meanings").delete().eq("id", meaningId);
  revalidatePath("/symbols");
}
