import { cookies } from "next/headers";

const COOKIE = "summit_discord_session";

type Session = {
  userId: string;
  username: string;
  avatar?: string;
  roleIds: string[];
  permissions: string[];
  createdAt: number;
};

function b64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

async function sign(value: string) {
  const secret = process.env.DISCORD_SESSION_SECRET;
  if (!secret) throw new Error("DISCORD_SESSION_SECRET is not configured.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Buffer.from(signature).toString("base64url");
}

async function verify(value: string, signature: string) {
  const secret = process.env.DISCORD_SESSION_SECRET;
  if (!secret) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, Buffer.from(signature, "base64url"), new TextEncoder().encode(value));
}

export async function createSession(session: Session) {
  const payload = b64url(JSON.stringify(session));
  const signature = await sign(payload);
  const jar = await cookies();
  jar.set(COOKIE, payload + "." + signature, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function getSession(): Promise<Session | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  if (!(await verify(payload, signature))) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
