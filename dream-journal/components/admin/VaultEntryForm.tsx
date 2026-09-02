import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";
import type { VaultCategory, VaultContent } from "@/types/database";

const CATEGORIES: { value: VaultCategory; label: string }[] = [
  { value: "biblical_dream_library", label: "Biblical dream library" },
  { value: "symbol_library", label: "Symbol library" },
  { value: "interpretation_framework", label: "Interpretation framework" },
  { value: "case_studies", label: "Case studies" },
  { value: "scripture_library", label: "Scripture library" },
  { value: "prayer_resources", label: "Prayer resources" },
  { value: "teaching_library", label: "Teaching library" },
];

export function VaultEntryForm({
  action,
  entry,
  error,
}: {
  action: (formData: FormData) => void;
  entry?: VaultContent;
  error?: string;
}) {
  return (
    <form action={action} className="space-y-5">
      {error && (
        <p className="text-sm text-danger border border-danger/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <label className="block">
        <span className="block text-sm text-text-muted mb-1.5">Category</span>
        <select name="category" defaultValue={entry?.category} required className={inputClasses}>
          <option value="" disabled>
            Choose a category
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="block text-sm text-text-muted mb-1.5">Title</span>
        <input type="text" name="title" defaultValue={entry?.title} required className={inputClasses} />
      </label>

      <label className="block">
        <span className="block text-sm text-text-muted mb-1.5">Body</span>
        <textarea
          name="body"
          rows={10}
          defaultValue={entry?.body}
          required
          className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm leading-relaxed focus:border-lamp resize-y"
        />
      </label>

      <label className="block">
        <span className="block text-sm text-text-muted mb-1.5">
          Scripture references, one per line
        </span>
        <textarea
          name="scripture_references"
          rows={3}
          defaultValue={entry?.scripture_references?.join("\n")}
          className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm focus:border-lamp resize-y"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={entry?.published ?? false} />
        Published, visible in the Vault
      </label>

      <Button type="submit">Save entry</Button>
    </form>
  );
}
