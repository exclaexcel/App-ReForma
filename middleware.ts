import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function sanitizeNextPath(raw: string | null): string | null {
  if (!raw) return null;
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
}

export async function middleware(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Auth emails sometimes land on Site URL (`/?code=`) instead of the callback.
  // Forward the code so recovery always reaches /atualizar-senha.
  const authCode = request.nextUrl.searchParams.get("code");
  if (authCode && !request.nextUrl.pathname.startsWith("/api/auth/")) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/api/auth/callback";
    callbackUrl.search = "";
    callbackUrl.searchParams.set("code", authCode);
    const type = request.nextUrl.searchParams.get("type");
    if (type) callbackUrl.searchParams.set("type", type);
    const safeNext = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
    if (safeNext) {
      callbackUrl.searchParams.set("next", safeNext);
    } else if (type === "recovery" || (!type && request.nextUrl.pathname === "/")) {
      // Site URL fallback lands on `/` with ?code= — ReForma has email confirmations off,
      // so this path is the password-recovery case we must not drop on the Hub.
      callbackUrl.searchParams.set("next", "/atualizar-senha");
    } else {
      callbackUrl.searchParams.set("next", "/");
    }
    return NextResponse.redirect(callbackUrl);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  let authError = false;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    authError = true;
  }

  const isLoginOrSignup =
    request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");

  const isPublicPage =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/recuperar-senha") ||
    request.nextUrl.pathname.startsWith("/atualizar-senha") ||
    request.nextUrl.pathname.startsWith("/api/auth/");

  if ((authError || !user) && !isLoginOrSignup && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginOrSignup) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
