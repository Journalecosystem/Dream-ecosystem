import { addSymbol, deleteSymbol } from "@/lib/actions/dreams";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";
import type { DreamSymbol } from "@/types/database";

export function SymbolsSection({
  dreamId,
  symbols,
}: {
  dreamId: string;
  symbols: DreamSymbol[];
}) {
  const addAction = addSymbol.bind(null, dreamId);

  return (
    <div className="space-y-6">
      {symbols.length > 0 && (
        <ul className="space-y-3">
          {symbols.map((symbol) => {
            const removeAction = deleteSymbol.bind(null, dreamId, symbol.id);
            return (
              <li
                key={symbol.id}
                className="flex items-start justify-between gap-4 border border-line rounded-sm px-4 py-3"
              >
                <div>
                  <p className="text-text">
                    {symbol.value}
                    {symbol.category && (
                      <span className="text-text-muted"> · {symbol.category}</span>
                    )}
                  </p>
                  {symbol.notes && (
                    <p className="text-sm text-text-muted mt-1">{symbol.notes}</p>
                  )}
                </div>
                <form action={removeAction}>
                  <button className="text-xs text-text-muted hover:text-danger">
                    Remove
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      <form action={addAction} className="space-y-3 border-t border-line pt-5">
        <p className="text-sm text-text-muted">
          Add a location, color, number, object, or other detail you noticed
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="text" name="value" placeholder="What you observed" required className={inputClasses} />
          <input
            type="text"
            name="category"
            placeholder="Type, for example color or location"
            className={inputClasses}
          />
        </div>
        <textarea
          name="notes"
          placeholder="Any note on this, without concluding what it means"
          rows={2}
          className={`${inputClasses} resize-none`}
        />
        <Button type="submit" variant="quiet">
          Add detail
        </Button>
      </form>
    </div>
  );
}
