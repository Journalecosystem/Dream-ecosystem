"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dbErrorMessage, failTo, requireUser } from "@/lib/actions/helpers";

// A personal symbol meaning belongs to the user, never to a universal
// dictionary. This never gets overwritten by reference content elsewhere.
export async function upsertPersonalSymbolMeaning(formData: FormData) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const symbol = String(formData.get("symbol") ?? "").trim();
  if (!symbol) {
    failTo("/symbols", "Enter a symbol before saving its meaning.");
  }

  const personalMeaning = String(formData.get("personal_meaning") ?? "").trim() || null;

  // One meaning per person per symbol (unique index from migration 0008).
  const { error } = await supabase.from("personal_symbol_meanings").upsert(
    {
      user_id: user.id,
      symbol,
      personal_meaning: personalMeaning,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,symbol" }
  );

  if (error) {
    failTo("/symbols", dbErrorMessage(error));
  }

  revalidatePath("/symbols");
}

export async function deletePersonalSymbolMeaning(meaningId: string) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const { error } = await supabase
    .from("personal_symbol_meanings")
    .delete()
    .eq("id", meaningId)
    .eq("user_id", user.id);

  if (error) {
    failTo("/symbols", dbErrorMessage(error));
  }

  revalidatePath("/symbols");
}
