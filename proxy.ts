import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const isDebugPage =
    request.nextUrl.pathname === "/debug-auth" ||
    request.nextUrl.pathname === "/test-cookies" ||
    request.nextUrl.pathname.includes("/dashboard/debug");

  if (request.nextUrl.pathname.startsWith("/dashboard") && !isDebugPage) {
    if (!user) {
      if (process.env.NODE_ENV === "development") {
        const allCookies = request.cookies.getAll();
        const supabaseCookies = allCookies.filter(
          (c) => c.name.includes("supabase") || c.name.includes("sb-")
        );
        console.log("Proxy: Redirecting to login", {
          pathname: request.nextUrl.pathname,
          hasUser: !!user,
          userError: userError?.message,
          supabaseCookiesCount: supabaseCookies.length,
          cookieNames: allCookies.map((c) => c.name),
        });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register") &&
    user
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

