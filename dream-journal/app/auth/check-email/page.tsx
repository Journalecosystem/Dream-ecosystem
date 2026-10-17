import Link from "next/link";
import { resendConfirmation } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    resent?: string;
    error?: string;
    unconfirmed?: string;
  }>;
}) {
  const { email, resent, error, unconfirmed } = await searchParams;

  return (
    <main id="main" className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-base text-text-muted mb-10">
          Dream Journal
        </Link>

        <h1 className="text-2xl mb-3">Check your email</h1>

        {unconfirmed ? (
          <p className="text-text-muted text-base">
            This account has not been confirmed yet. Open the confirmation
            link we sent{email ? ` to ${email}` : ""}, or request a new one
            below.
          </p>
        ) : (
          <p className="text-text-muted text-base">
            A confirmation link has been sent{email ? ` to ${email}` : ""}.
            Click it to activate your account. It may take a few minutes to
            arrive, and check your spam folder if not.
          </p>
        )}

        {resent && (
          <p className="text-base text-text border border-line rounded-sm px-3 py-3 mt-6">
            A new confirmation email has been sent.
          </p>
        )}
        {error && (
          <p className="text-base text-danger mb-4 border border-danger/30 rounded-sm px-3 py-2 mt-6">
            {error}
          </p>
        )}

        {email && (
          <form action={resendConfirmation} className="mt-8">
            <input type="hidden" name="email" value={email} />
            <Button type="submit" variant="quiet" className="w-full">
              Send the email again
            </Button>
          </form>
        )}

        <p className="text-base text-text-muted mt-6">
          If you already registered with this address, no new email is sent.
          Sign in instead, or{" "}
          <Link href="/auth/reset-password" className="underline">
            reset your password
          </Link>
          .
        </p>

        <p className="text-base text-text-muted mt-8">
          <Link href="/auth?mode=signin" className="underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
