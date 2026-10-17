"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "dj-text-size";

type Size = "normal" | "large" | "largest";

const OPTIONS: { value: Size; label: string; aria: string; fontPx: number }[] = [
  { value: "normal", label: "A", aria: "Normal text size", fontPx: 18 },
  { value: "large", label: "A", aria: "Large text size", fontPx: 24 },
  { value: "largest", label: "A", aria: "Largest text size", fontPx: 30 },
];

// The chosen size lives on <html data-text-size="...">, which a small script
// in the layout sets before the first paint. This store just reads and
// updates that attribute, so React and the DOM can never disagree.
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): Size {
  const value = document.documentElement.dataset.textSize;
  return value === "large" || value === "largest" ? value : "normal";
}

function getServerSnapshot(): Size {
  return "normal";
}

function chooseSize(size: Size) {
  document.documentElement.dataset.textSize = size;
  try {
    if (size === "normal") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, size);
  } catch {
    // Storage can be blocked (private mode). The size still applies for
    // this visit.
  }
  listeners.forEach((listener) => listener());
}

// Sits above every page. Sizes are fixed pixels on purpose: this control
// must stay readable and findable even at the smallest setting, and must not
// grow so large at "largest" that it crowds the page.
export function TextSizeControl() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      className="w-full border-b border-line bg-paper-raised"
      style={{ height: "var(--textbar-h)" }}
    >
      <div
        role="group"
        aria-label="Text size"
        className="max-w-3xl mx-auto h-full px-4 flex items-center justify-end gap-2"
        style={{ fontSize: 16 }}
      >
        <span className="font-semibold mr-1">Text size</span>
        {OPTIONS.map((option) => {
          const active = current === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-label={option.aria}
              aria-pressed={active}
              onClick={() => chooseSize(option.value)}
              className={`rounded-sm border-2 font-bold leading-none flex items-center justify-center ${
                active
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-text border-line-strong hover:border-ink"
              }`}
              style={{ width: 44, height: 40, fontSize: option.fontPx - 4 }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
