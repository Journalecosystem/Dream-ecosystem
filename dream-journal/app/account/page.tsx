import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteAccountControl } from "@/components/dreams/DeleteAccountControl";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>

      <h1 className="text-2xl mt-6 mb-8">Account</h1>

      <p className="text-sm text-text-muted mb-10">{user?.email}</p>

      <section className="border-t border-line pt-6 mb-10">
        <h2 className="text-base mb-2">Export your data</h2>
        <p className="text-sm text-text-muted mb-4">
          Download everything you have recorded as a single file you keep.
        </p>
        <a
          href="/api/account/export"
          className="inline-flex items-center justify-center rounded-sm border border-line px-4 py-2 text-sm hover:border-ink"
        >
          Download export
        </a>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-base mb-2">Delete account</h2>
        <p className="text-sm text-text-muted mb-4">
          This permanently removes your account and every dream, examination,
          and note recorded against it. This cannot be undone.
        </p>
        <DeleteAccountControl />
      </section>
    </main>
  );
}
