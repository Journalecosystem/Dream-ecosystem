import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { updateCircleGuidelines } from "@/lib/actions/admin-circles";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";

export default async function EditCirclePage({
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

  const { data: circle } = await supabase.from("circles").select("*").eq("id", id).single();
  if (!circle) notFound();

  const action = updateCircleGuidelines.bind(null, id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/admin/circles" className="text-sm text-text-muted">
        ← Circles
      </Link>
      <h1 className="text-2xl mt-6 mb-2">Edit circle</h1>
      <p className="text-sm text-text-muted mb-8">
        Currently on guidelines version {circle.guidelines_version}.
      </p>

      {error && (
        <p className="text-sm text-danger mb-4 border border-danger/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <form action={action} className="space-y-5">
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">Title</span>
          <input type="text" name="title" defaultValue={circle.title} required className={inputClasses} />
        </label>
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">Description</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={circle.description ?? ""}
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm focus:border-lamp resize-y"
          />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="bump_guidelines" className="mt-1" />
          <span>
            Require members to accept the guidelines again. Use this if you
            changed the guidelines text meaningfully, not for small edits.
          </span>
        </label>
        <Button type="submit">Save circle</Button>
      </form>
    </main>
  );
}
