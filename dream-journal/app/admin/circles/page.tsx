import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

export default async function AdminCirclesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: circles } = await supabase
    .from("circles")
    .select("id, title, description, guidelines_version")
    .order("title");

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/admin" className="text-sm text-text-muted">
        ← Admin
      </Link>
      <div className="flex items-center justify-between mt-6 mb-8">
        <h1 className="text-2xl">Circles</h1>
        <Link href="/admin/circles/new">
          <Button>New circle</Button>
        </Link>
      </div>

      {!circles || circles.length === 0 ? (
        <p className="text-sm text-text-muted py-12 text-center">
          No circles yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {circles.map((circle) => (
            <li key={circle.id} className="flex items-center justify-between gap-4 py-3 border-b border-line">
              <span className="min-w-0">
                <span className="block text-text truncate">{circle.title}</span>
                <span className="block text-xs text-text-muted">
                  Guidelines version {circle.guidelines_version}
                </span>
              </span>
              <Link
                href={`/admin/circles/${circle.id}/edit`}
                className="text-sm text-text-muted hover:text-text shrink-0"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
