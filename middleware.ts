import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/staff")) return NextResponse.next();

  if (req.nextUrl.pathname === "/staff") {
    const session = req.cookies.get("summit_discord_session")?.value;

    // Discord is configured to redirect directly to /staff.
    // Forward the OAuth code to the real callback route so the code can
    // be exchanged for a session before the staff dashboard loads.
    const code = req.nextUrl.searchParams.get("code");
    if (!session && code) {
      const callback = new URL("/api/auth/discord/callback", req.url);
      callback.searchParams.set("code", code);
      return NextResponse.redirect(callback);
    }

    if (!session) {
      return NextResponse.redirect(new URL("/api/auth/discord/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*"]
};
