import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dreams",
  "/account",
  "/symbols",
  "/timeline",
  "/graph",
  "/testimonies",
  "/vault",
  "/circles",
  "/formation",
  "/admin",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    // Drop the original query string: it can carry an ?error= message meant
    // for the page the person was on, which must not show up on sign in.
    url.search = "";
    return NextResponse.redirect(url);
  }

  // A signed in person opening the sign in page goes straight to their
  // journal. Only the exact /auth path: /auth/update-password and the
  // callback must stay reachable while signed in.
  if (user && request.nextUrl.pathname === "/auth") {
    const url = request.nextUrl.clone();
    url.pathname = "/dreams";
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    // Keep any session cookies refreshed above.
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}
