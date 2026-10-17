import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>
      <h1 className="text-2xl mt-6 mb-8">Admin</h1>
      <div className="space-y-1">
        <Link href="/admin/vault" className="block py-4 border-b border-line hover:text-lamp">
          Manage Vault content
        </Link>
        <Link href="/admin/circles" className="block py-4 border-b border-line hover:text-lamp">
          Manage Circles
        </Link>
      </div>
    </main>
  );
}
