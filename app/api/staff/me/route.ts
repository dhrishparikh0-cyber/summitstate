import { NextResponse } from "next/server";
import { getSession } from "@/lib/discord-session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, staff: false, permissions: [] }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    staff: true,
    user: {
      id: session.userId,
      username: session.username,
      avatar: session.avatar
    },
    roleIds: session.roleIds,
    permissions: session.permissions
  });
}
