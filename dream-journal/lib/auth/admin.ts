import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

// Used only by admin actions (e.g. assigning a circle facilitator) that need
// to turn an email address into a user id. The admin auth API has no direct
// "get by email" call, so this pages through listUsers and matches. Fine at
// this app's scale; revisit with a profiles table if the user base grows
// large enough to make this slow.
export async function getUserIdByEmail(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const admin = createAdminClient();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data) return null;

    const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (match) return match.id;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}
