import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type DreamRef = { id: string; title: string | null; dream_date: string };
type Connection = { dream: DreamRef; via: string; label: string };

export default async function GraphPage() {
  const supabase = await createClient();

  const [{ data: symbolRows }, { data: peopleRows }] = await Promise.all([
    supabase.from("dream_symbols").select("value, dreams(id, title, dream_date)"),
    supabase.from("dream_people").select("name, dreams(id, title, dream_date)"),
  ]);

  const byKey = new Map<string, { label: string; via: string; dreams: DreamRef[] }>();

  function ingest(
    rows: { value?: string; name?: string | null; dreams: unknown }[] | null,
    via: string
  ) {
    for (const row of rows ?? []) {
      const raw = via === "symbol" ? row.value : row.name;
      if (!raw || !raw.trim()) continue;
      const dream = Array.isArray(row.dreams) ? row.dreams[0] : row.dreams;
      if (!dream) continue;
      const key = `${via}:${raw.trim().toLowerCase()}`;
      if (!byKey.has(key)) byKey.set(key, { label: raw.trim(), via, dreams: [] });
      const group = byKey.get(key)!;
      if (!group.dreams.some((d) => d.id === (dream as DreamRef).id)) {
        group.dreams.push(dream as DreamRef);
      }
    }
  }

  ingest(symbolRows ?? [], "symbol");
  ingest((peopleRows ?? []) as never, "person");

  const connectionsByDream = new Map<string, Connection[]>();
  for (const group of byKey.values()) {
    if (group.dreams.length < 2) continue;
    for (const dream of group.dreams) {
      for (const other of group.dreams) {
        if (other.id === dream.id) continue;
        const list = connectionsByDream.get(dream.id) ?? [];
        list.push({ dream: other, via: group.via, label: group.label });
        connectionsByDream.set(dream.id, list);
      }
    }
  }

  const dreamsById = new Map<string, DreamRef>();
  for (const group of byKey.values()) {
    for (const d of group.dreams) dreamsById.set(d.id, d);
  }

  const connectedDreams = Array.from(dreamsById.values()).sort(
    (a, b) => new Date(b.dream_date).getTime() - new Date(a.dream_date).getTime()
  );

  return (
    <main id="main" className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dreams" className="text-sm text-text-muted">
        ← Your dreams
      </Link>
      <h1 className="text-2xl mt-6 mb-2">Connections</h1>
      <p className="text-sm text-text-muted mb-8">
        This is pattern recognition across your own dreams, not prophecy. A
        shared symbol or person is worth noticing, not a conclusion.
      </p>

      {connectedDreams.length === 0 ? (
        <p className="text-sm text-text-muted py-12 text-center">
          As you record more dreams and the details within them, shared
          symbols and people across dreams will show up here.
        </p>
      ) : (
        <ul className="space-y-6">
          {connectedDreams.map((dream) => {
            const connections = connectionsByDream.get(dream.id) ?? [];
            return (
              <li key={dream.id} className="border-b border-line pb-6">
                <Link
                  href={`/dreams/${dream.id}`}
                  className="text-base hover:text-lamp"
                >
                  {dream.title?.trim() || "Untitled dream"}
                </Link>
                <ul className="mt-2 space-y-1">
                  {connections.map((connection, index) => (
                    <li key={index} className="text-sm text-text-muted">
                      Shares {connection.via} &ldquo;{connection.label}&rdquo; with{" "}
                      <Link
                        href={`/dreams/${connection.dream.id}`}
                        className="underline"
                      >
                        {connection.dream.title?.trim() || connection.dream.dream_date}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
