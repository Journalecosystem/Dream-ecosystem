import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { updateVaultEntry } from "@/lib/actions/admin-vault";
import { VaultEntryForm } from "@/components/admin/VaultEntryForm";

export default async function EditVaultEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: entry } = await supabase.from("vault_content").select("*").eq("id", id).single();
  if (!entry) notFound();

  const action = updateVaultEntry.bind(null, id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/admin/vault" className="text-sm text-text-muted">
        ← Vault content
      </Link>
      <h1 className="text-2xl mt-6 mb-8">Edit Vault entry</h1>
      <VaultEntryForm action={action} entry={entry} error={error} />
    </main>
  );
}
