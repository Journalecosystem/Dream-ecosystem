import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { createCircle } from "@/lib/actions/admin-circles";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";

export default async function NewCirclePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/admin/circles" className="text-sm text-text-muted">
        ← Circles
      </Link>
      <h1 className="text-2xl mt-6 mb-8">New circle</h1>

      {error && (
        <p className="text-sm text-danger mb-4 border border-danger/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <form action={createCircle} className="space-y-5">
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">Title</span>
          <input type="text" name="title" required className={inputClasses} />
        </label>
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">Description</span>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm focus:border-lamp resize-y"
          />
        </label>
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            Facilitator email (optional)
          </span>
          <input
            type="email"
            name="facilitator_email"
            placeholder="Leave blank for no facilitator"
            className={inputClasses}
          />
          <span className="block text-xs text-text-muted mt-1.5">
            Must be an email of someone who already has an account. The
            facilitator can remove members, unshare dreams, and remove
            responses in this circle.
          </span>
        </label>
        <Button type="submit">Create circle</Button>
      </form>
    </main>
  );
}
