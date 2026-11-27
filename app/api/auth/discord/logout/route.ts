import { NextResponse } from "next/server";
import { clearSession } from "@/lib/discord-session";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  await clearSession();
  return NextResponse.redirect(new URL("/", req.url));
}
