import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { deleteVaultEntry } from "@/lib/actions/admin-vault";
import { Button } from "@/components/ui/Button";
import { ErrorNotice } from "@/components/ui/ErrorNotice";

export default async function AdminVaultPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("vault_content")
    .select("id, title, category, published")
    .order("category")
    .order("title");

  return (
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/admin" className="text-sm text-text-muted">
        ← Admin
      </Link>
      <ErrorNotice message={error} />
      <div className="flex items-center justify-between mt-6 mb-8">
        <h1 className="text-2xl">Vault content</h1>
        <Link href="/admin/vault/new">
          <Button>New entry</Button>
        </Link>
      </div>

      {!entries || entries.length === 0 ? (
        <p className="text-sm text-text-muted py-12 text-center">
          No entries yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {entries.map((entry) => {
            const removeAction = deleteVaultEntry.bind(null, entry.id);
            return (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 py-3 border-b border-line"
              >
                <span className="min-w-0">
                  <span className="block text-text break-words">{entry.title}</span>
                  <span className="block text-xs text-text-muted">
                    {entry.category} · {entry.published ? "Published" : "Draft"}
                  </span>
                </span>
                <span className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/admin/vault/${entry.id}/edit`}
                    className="text-sm text-text-muted hover:text-text"
                  >
                    Edit
                  </Link>
                  <form action={removeAction}>
                    <button className="text-sm text-text-muted hover:text-danger">
                      Delete
                    </button>
                  </form>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
