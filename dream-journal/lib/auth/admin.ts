import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Admin access is gated by an email allowlist rather than a roles table,
// since there is exactly one ministry team operating this instance. If
// that ever changes, replace this with a real roles table and RLS policy.
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  if (!isAdminEmail(user.email)) {
    redirect("/dreams");
  }

  return user;
}
