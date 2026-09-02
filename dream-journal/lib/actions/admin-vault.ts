"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { VaultCategory } from "@/types/database";

const VALID_CATEGORIES: VaultCategory[] = [
  "biblical_dream_library",
  "symbol_library",
  "interpretation_framework",
  "case_studies",
  "scripture_library",
  "prayer_resources",
  "teaching_library",
];

function parseReferences(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function createVaultEntry(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const category = String(formData.get("category") ?? "");
  if (!VALID_CATEGORIES.includes(category as VaultCategory)) {
    redirect("/admin/vault/new?error=Choose+a+valid+category");
  }

  await admin.from("vault_content").insert({
    category,
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    scripture_references: parseReferences(String(formData.get("scripture_references") ?? "")),
    published: formData.get("published") === "on",
  });

  revalidatePath("/admin/vault");
  revalidatePath("/vault");
  redirect("/admin/vault");
}

export async function updateVaultEntry(entryId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const category = String(formData.get("category") ?? "");
  if (!VALID_CATEGORIES.includes(category as VaultCategory)) {
    redirect(`/admin/vault/${entryId}/edit?error=Choose+a+valid+category`);
  }

  await admin
    .from("vault_content")
    .update({
      category,
      title: String(formData.get("title") ?? "").trim(),
      body: String(formData.get("body") ?? "").trim(),
      scripture_references: parseReferences(String(formData.get("scripture_references") ?? "")),
      published: formData.get("published") === "on",
    })
    .eq("id", entryId);

  revalidatePath("/admin/vault");
  revalidatePath("/vault");
  redirect("/admin/vault");
}

export async function deleteVaultEntry(entryId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("vault_content").delete().eq("id", entryId);
  revalidatePath("/admin/vault");
  revalidatePath("/vault");
}
