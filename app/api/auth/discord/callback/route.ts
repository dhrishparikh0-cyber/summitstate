import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/discord-session";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) return NextResponse.redirect(new URL("/staff?error=discord_denied", req.url));
  if (!code) return NextResponse.redirect(new URL("/staff?error=missing_code", req.url));

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!clientId || !clientSecret || !redirectUri || !guildId) {
    return NextResponse.json({ error: "Discord OAuth environment variables are not configured." }, { status: 503 });
  }

  const tokenBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri
  });

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody,
    cache: "no-store"
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/staff?error=token_exchange_failed", req.url));
  }

  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) {
    return NextResponse.redirect(new URL("/staff?error=no_access_token", req.url));
  }

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store"
  });
  const user = await userResponse.json() as { id: string; username: string; avatar?: string };

  const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store"
  });

  if (!memberResponse.ok) {
    return NextResponse.redirect(new URL("/staff?error=not_in_summit_state", req.url));
  }

  const member = await memberResponse.json() as { roles?: string[] };
  const roleIds = member.roles ?? [];
  const staffRoleIds = (process.env.DISCORD_STAFF_ROLE_IDS ?? "").split(",").map(x => x.trim()).filter(Boolean);
  const isStaff = staffRoleIds.length > 0 && roleIds.some(id => staffRoleIds.includes(id));

  if (!isStaff) {
    return NextResponse.redirect(new URL("/staff?error=not_staff", req.url));
  }

  const permissions = ["view_dashboard", "applications", "moderation", "tickets", "staff", "announcements", "audit"];
  await createSession({
    userId: user.id,
    username: user.username,
    avatar: user.avatar,
    roleIds,
    permissions,
    createdAt: Date.now()
  });

  return NextResponse.redirect(new URL("/staff", req.url));
}
