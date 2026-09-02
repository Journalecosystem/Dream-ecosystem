import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";
import { inputClasses } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-sm text-text-muted mb-10">
          Dream Journal
        </Link>

        <h1 className="text-2xl mb-1">Reset your password</h1>
        <p className="text-text-muted text-sm mb-8">
          We will send a link to set a new password.
        </p>

        {sent ? (
          <p className="text-sm text-text border border-line rounded-sm px-3 py-3">
            If that email has an account, a reset link is on its way. It may
            take a few minutes to arrive, and check your spam folder if not.
          </p>
        ) : (
          <form action={requestPasswordReset} className="space-y-4">
            <label className="block">
              <span className="block text-sm text-text-muted mb-1.5">Email</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className={inputClasses}
              />
            </label>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
        )}

        <p className="text-sm text-text-muted mt-6">
          <Link href="/auth?mode=signin" className="underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
