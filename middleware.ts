import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// Use a lightweight NextAuth instance (no Credentials/bcryptjs) for edge middleware.
// The JWT is verified by the shared AUTH_SECRET; role/id are read from the token.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isAuthRoute    = nextUrl.pathname.startsWith("/login");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute  = isAuthRoute || isApiAuthRoute;

  if (isPublicRoute) return NextResponse.next();

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes — require ADMIN role
  if (nextUrl.pathname.startsWith("/admin")) {
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
