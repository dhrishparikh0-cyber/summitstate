import { NextResponse } from "next/server";

export async function GET() {
  const client = process.env.DISCORD_CLIENT_ID;
  const redirect = process.env.DISCORD_REDIRECT_URI;
  const guild = process.env.DISCORD_GUILD_ID;

  if (!client || !redirect || !guild) {
    return NextResponse.json({ error: "Discord OAuth is not configured yet." }, { status: 503 });
  }

  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", client);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify guilds guilds.members.read");
  return NextResponse.redirect(url);
}
