import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateDreamMeta, deleteDream } from "@/lib/actions/dreams";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";

export default async function EditDreamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: dream } = await supabase.from("dreams").select("*").eq("id", id).single();

  if (!dream) notFound();

  const saveAction = updateDreamMeta.bind(null, id);
  const removeAction = deleteDream.bind(null, id);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/dreams/${id}`} className="text-sm text-text-muted">
        ← Back to dream
      </Link>

      <h1 className="text-2xl mt-6 mb-8">Edit details</h1>

      <form action={saveAction} className="space-y-4">
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">Title</span>
          <input
            type="text"
            name="title"
            defaultValue={dream.title ?? ""}
            className={inputClasses}
          />
        </label>
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">Date</span>
          <input
            type="date"
            name="dream_date"
            defaultValue={dream.dream_date}
            required
            className={inputClasses}
          />
        </label>
        <label className="block">
          <span className="block text-sm text-text-muted mb-1.5">
            Dream type
          </span>
          <input
            type="text"
            name="dream_type"
            defaultValue={dream.dream_type ?? ""}
            className={inputClasses}
          />
        </label>
        <Button type="submit">Save changes</Button>
      </form>

      <div className="mt-12 pt-6 border-t border-line">
        <p className="text-sm text-text-muted mb-3">
          Removing a dream deletes it and everything recorded against it.
          This cannot be undone.
        </p>
        <form action={removeAction}>
          <Button type="submit" variant="danger">
            Delete this dream
          </Button>
        </form>
      </div>
    </main>
  );
}
