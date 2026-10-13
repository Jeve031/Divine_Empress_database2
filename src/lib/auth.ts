import { cookies } from "next/headers";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Storm";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Caleb27/02";
export const SESSION_COOKIE_NAME = "divine_empress_admin_session";
export const ADMIN_TOKEN_STORAGE_KEY = "divine_empress_admin_token";

export async function verifyAdminCredentials(user: string, pass: string): Promise<boolean> {
  return user.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() && pass === ADMIN_PASSWORD;
}

export async function createAdminSession(username: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    await db.insert(adminSessions).values({
      token,
      username,
      expiresAt,
    });
  } catch (err) {
    console.error("Failed to insert admin session:", err);
  }

  return token;
}

async function verifyTokenInDb(token: string): Promise<{ username: string } | null> {
  try {
    const session = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.token, token))
      .limit(1);

    if (session.length > 0) {
      if (new Date(session[0].expiresAt) > new Date()) {
        return { username: session[0].username };
      } else {
        await db.delete(adminSessions).where(eq(adminSessions.token, token));
      }
    }
  } catch (err) {
    console.error("Session lookup error:", err);
  }
  return null;
}

function parseCookieHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

/** Extract session token from a Request: Authorization Bearer header first, then Cookie header. */
export function extractTokenFromRequest(req: Request): string | null {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization");
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const t = auth.slice(7).trim();
      if (t) return t;
    }
  } catch {
    /* ignore */
  }
  try {
    const cookieHeader = req.headers.get("cookie");
    const fromHeader = parseCookieHeader(cookieHeader, SESSION_COOKIE_NAME);
    if (fromHeader) return fromHeader;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Preferred auth check for route handlers.
 * Pass the incoming Request so we can read BOTH:
 *  - Authorization: Bearer <token> (works inside iframes / preview embeds where 3rd-party cookies are blocked)
 *  - Cookie header / next/headers cookies() (works for normal direct visits)
 */
export async function getAdminSessionFromRequest(
  req: Request
): Promise<{ username: string } | null> {
  // 1) Bearer token
  const bearerToken = extractTokenFromRequest(req);
  if (bearerToken) {
    const s = await verifyTokenInDb(bearerToken);
    if (s) return s;
  }

  // 2) next/headers cookie store (same-origin direct visits)
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (cookieToken && cookieToken !== bearerToken) {
      const s = await verifyTokenInDb(cookieToken);
      if (s) return s;
    }
  } catch (err) {
    console.error("Cookie store lookup error:", err);
  }

  return null;
}

/** Backwards-compatible cookie-only check (used where no Request is available). */
export async function getAdminSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;
  return verifyTokenInDb(token);
}

export async function deleteAdminSession(token: string): Promise<void> {
  try {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  } catch (err) {
    console.error("Delete session error:", err);
  }
}
