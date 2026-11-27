import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/staff")) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/staff") && req.nextUrl.pathname === "/staff") {
    const session = req.cookies.get("summit_discord_session")?.value;
    if (!session) {
      return NextResponse.redirect(new URL("/api/auth/discord/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*"]
};
