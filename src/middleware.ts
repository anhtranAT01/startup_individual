import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

const PROTECTED_PREFIXES = ["/student", "/employer", "/admin", "/notifications"];

function homeByRole(role?: string | null): string {
  if (role === "admin") return "/admin";
  if (role === "employer") return "/employer/dashboard";
  return "/student/dashboard";
}

function inferSandboxRole(uid: string, roleCookie?: string): string {
  if (roleCookie === "admin" || roleCookie === "employer" || roleCookie === "student") {
    return roleCookie;
  }
  if (uid.startsWith("00000000-")) return "admin";
  if (uid.startsWith("10000000-")) return "employer";
  return "student";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isSupabaseConfigured()) {
    if (needsAuth) {
      const uid = request.cookies.get("stuwork_sandbox_uid")?.value;
      if (!uid) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const role = inferSandboxRole(
        uid,
        request.cookies.get("stuwork_sandbox_role")?.value
      );

      if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL(homeByRole(role), request.url));
      }
      if (pathname.startsWith("/employer") && role !== "employer") {
        return NextResponse.redirect(new URL(homeByRole(role), request.url));
      }
      if (pathname.startsWith("/student") && role !== "student") {
        return NextResponse.redirect(new URL(homeByRole(role), request.url));
      }
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (needsAuth && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    user &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/employer") ||
      pathname.startsWith("/student"))
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.is_active) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/admin") && profile.role !== "admin") {
      return NextResponse.redirect(
        new URL(homeByRole(profile.role), request.url)
      );
    }
    if (pathname.startsWith("/employer") && profile.role !== "employer") {
      return NextResponse.redirect(
        new URL(homeByRole(profile.role), request.url)
      );
    }
    if (pathname.startsWith("/student") && profile.role !== "student") {
      return NextResponse.redirect(
        new URL(homeByRole(profile.role), request.url)
      );
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo/|images/|api/files/).*)",
  ],
};
