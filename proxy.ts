import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getEventDateTime } from "@/lib/event/config";

/**
 * Next.js 16 middleware — `proxy.ts` is the v16 rename of `middleware.ts`, the
 * export must be named `proxy`, and setting `runtime` here would throw.
 *
 *  1. Prelaunch gate: lock the site to /prelaunch until `EVENT_DATETIME`.
 *  2. Refresh the Supabase session cookie on every matched request.
 *  3. Guard routes: unauthenticated off protected, authenticated off /login.
 */
const PROTECTED_ROUTES = ["/todo", "/award-system", "/kudos", "/profile"];
const AUTH_ROUTES = ["/login"];
const PRELAUNCH_ROUTE = "/prelaunch";

function matches(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Runs first so it supersedes the auth guards. After the event the countdown
  // page stops being a gate and bounces home.
  const target = getEventDateTime();
  const beforeEvent = target !== null && Date.now() < target.getTime();
  const onPrelaunch = matches(pathname, [PRELAUNCH_ROUTE]);

  if (beforeEvent && !onPrelaunch) {
    const url = request.nextUrl.clone();
    url.pathname = PRELAUNCH_ROUTE;
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (!beforeEvent && onPrelaunch) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const { supabaseResponse, user } = await updateSession(request);

  // Unauthenticated user on a protected route → login, remembering the target.
  if (!user && matches(pathname, PROTECTED_ROUTES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user on the login page → straight into the app.
  if (user && matches(pathname, AUTH_ROUTES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Pass-through: return the response carrying refreshed session cookies.
  return supabaseResponse;
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets, so refreshed cookies
    // reach the browser without intercepting /_next or media.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
