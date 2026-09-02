import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { createVaultEntry } from "@/lib/actions/admin-vault";
import { VaultEntryForm } from "@/components/admin/VaultEntryForm";

export default async function NewVaultEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/admin/vault" className="text-sm text-text-muted">
        ← Vault content
      </Link>
      <h1 className="text-2xl mt-6 mb-8">New Vault entry</h1>
      <VaultEntryForm action={createVaultEntry} error={error} />
    </main>
  );
}
