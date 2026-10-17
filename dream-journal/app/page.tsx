import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <main id="main" className="min-h-screen flex flex-col">
      <header className="px-6 py-6 flex items-center justify-between max-w-3xl mx-auto w-full">
        <span className="text-base font-bold">Dream Journal</span>
        <Link href="/auth?mode=signin" className="text-base font-semibold underline hover:text-ink-soft">
          Sign in
        </Link>
      </header>

      <section className="flex-1 flex items-center px-6">
        <div className="max-w-2xl mx-auto w-full py-16">
          <h1 className="text-4xl sm:text-5xl mb-6">
            Remember what you dreamed. Examine what it meant.
          </h1>
          <p className="text-lg text-text prose-measure mb-10">
            A quiet place to capture a dream before it fades, then return to
            it later with a clear method for examining, processing, and
            testing what you understood, over months and years, not just one
            night.
          </p>
          <Link href="/auth?mode=signup">
            <Button className="text-base px-6 py-3">Start your journal</Button>
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto w-full grid sm:grid-cols-3 gap-8 border-t border-line pt-10">
          <div>
            <h2 className="text-lg mb-2">Capture</h2>
            <p className="text-base text-text-muted">
              Write it down before memory changes it. Nothing else required.
            </p>
          </div>
          <div>
            <h2 className="text-lg mb-2">Examine</h2>
            <p className="text-base text-text-muted">
              Record the context around a dream separately from what it might mean.
            </p>
          </div>
          <div>
            <h2 className="text-lg mb-2">Process</h2>
            <p className="text-base text-text-muted">
              Sit with it. Ask honest questions before reaching for an answer.
            </p>
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-line">
        <p className="text-sm text-text-muted max-w-2xl mx-auto prose-measure">
          This journal is a tool for reflection. It does not replace
          Scripture, prayer, or the counsel of people who know you well.
        </p>
      </footer>
    </main>
  );
}
