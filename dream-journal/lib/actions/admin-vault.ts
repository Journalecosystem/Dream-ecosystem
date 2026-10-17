"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { dbErrorMessage, failTo } from "@/lib/actions/helpers";
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
    failTo("/admin/vault/new", "Choose a valid category.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) {
    failTo("/admin/vault/new", "A title and body are both required.");
  }

  const { error } = await admin.from("vault_content").insert({
    category,
    title,
    body,
    scripture_references: parseReferences(String(formData.get("scripture_references") ?? "")),
    published: formData.get("published") === "on",
  });

  if (error) {
    failTo("/admin/vault/new", dbErrorMessage(error));
  }

  revalidatePath("/admin/vault");
  revalidatePath("/vault");
  redirect("/admin/vault");
}

export async function updateVaultEntry(entryId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const category = String(formData.get("category") ?? "");
  if (!VALID_CATEGORIES.includes(category as VaultCategory)) {
    failTo(`/admin/vault/${entryId}/edit`, "Choose a valid category.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) {
    failTo(`/admin/vault/${entryId}/edit`, "A title and body are both required.");
  }

  const { error } = await admin
    .from("vault_content")
    .update({
      category,
      title,
      body,
      scripture_references: parseReferences(String(formData.get("scripture_references") ?? "")),
      published: formData.get("published") === "on",
    })
    .eq("id", entryId);

  if (error) {
    failTo(`/admin/vault/${entryId}/edit`, dbErrorMessage(error));
  }

  revalidatePath("/admin/vault");
  revalidatePath("/vault");
  redirect("/admin/vault");
}

export async function deleteVaultEntry(entryId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("vault_content").delete().eq("id", entryId);
  if (error) {
    failTo("/admin/vault", dbErrorMessage(error, "Could not delete that entry. Please try again."));
  }
  revalidatePath("/admin/vault");
  revalidatePath("/vault");
}
