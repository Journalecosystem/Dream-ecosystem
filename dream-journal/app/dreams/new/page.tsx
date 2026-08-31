import Link from "next/link";
import { NewDreamForm } from "@/components/dreams/NewDreamForm";

export default async function NewDreamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>

      <h1 className="text-2xl mt-6 mb-8">Record a dream</h1>

      {error && (
        <p className="text-sm text-danger mb-4 border border-danger/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <NewDreamForm />
    </main>
  );
}
