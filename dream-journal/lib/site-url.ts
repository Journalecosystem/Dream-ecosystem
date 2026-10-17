import { headers } from "next/headers";

// The public origin of this app, used to build links that Supabase puts in
// emails (confirmation, password reset). If NEXT_PUBLIC_SITE_URL is set it
// always wins, which is the most reliable option in production. Otherwise
// the origin is read from the incoming request.
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol =
    headersList.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
