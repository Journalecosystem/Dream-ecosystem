import { redirect } from "next/navigation";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Sends the person back to a page with a message the page displays in an
// error notice. Optional `extra` params (for example `open`, which tells the
// dream page which section to leave expanded) are added to the URL.
//
// This file is deliberately NOT a "use server" file: those may only export
// async functions that browsers can call, and these are internal helpers.
export function failTo(
  path: string,
  message: string,
  extra: Record<string, string> = {}
): never {
  const params = new URLSearchParams({ error: message, ...extra });
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}${params.toString()}`);
}

// Turns a database error into a sentence a person can act on. The raw
// Postgres text ("violates foreign key constraint ...") is never shown.
export function dbErrorMessage(
  error: { message?: string; code?: string } | null | undefined,
  fallback = "Could not save. Please try again."
): string {
  switch (error?.code) {
    case "42501": // row level security: not allowed
      return "You do not have permission to do that.";
    case "23503": // foreign key violation
      return "That item no longer exists, or is linked to something that has to be removed first.";
    case "23505": // unique violation
      return "That was already saved. Reload the page and try again.";
    case "23514": // check constraint
    case "22P02": // invalid input syntax (bad uuid, number, ...)
    case "22007": // invalid date/time format
      return "One of the values entered is not valid. Check it and try again.";
    case "23502": // not null violation
      return "A required value is missing.";
    case "42P10": // ON CONFLICT without a matching unique index
    case "42703": // column does not exist
    case "42P01": // table does not exist
      return "The database is missing its latest update. The administrator needs to run the newest files in supabase/migrations.";
    default:
      return fallback;
  }
}

// Returns the signed in user or sends the visitor to sign in.
export async function requireUser(supabase: SupabaseServerClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  return user;
}
