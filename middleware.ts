import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Check authentication for protected routes
  const session = await auth();

  // If user is banned, redirect to a banned page or sign out
  if (session?.user && (session.user as any)?.isBanned) {
    // Force sign out by redirecting to sign-in with error
    return NextResponse.redirect(
      new URL("/auth/signin?error=banned", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/owner/:path*",
    "/api/bookings/:path*",
    "/api/venues/:path*",
    "/api/owner/:path*",
    "/api/admin/:path*",
    // Temporarily excluding user API routes to debug
    // "/api/user/:path*",
  ],
};
