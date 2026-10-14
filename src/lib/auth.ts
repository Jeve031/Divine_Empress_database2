import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Storm";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Caleb27/02";

export const SESSION_COOKIE_NAME = "divine_empress_admin_session";
export const ADMIN_TOKEN_STORAGE_KEY = "divine_empress_admin_token";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.ADMIN_PASSWORD ||
    ADMIN_PASSWORD
  );
}

function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  try {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);

    if (aBuffer.length !== bBuffer.length) return false;

    return crypto.timingSafeEqual(aBuffer, bBuffer);
  } catch {
    return false;
  }
}

export async function verifyAdminCredentials(user: string, pass: string): Promise<boolean> {
  return (
    user.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
    pass === ADMIN_PASSWORD
  );
}

export async function createAdminSession(username: string): Promise<string> {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      exp: Date.now() + SESSION_DURATION_MS,
    }),
    "utf8"
  ).toString("base64url");

  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    const [payload, signature] = token.split(".");

    if (!payload || !signature) return null;

    const expectedSignature = signPayload(payload);

    if (!safeEqual(signature, expectedSignature)) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as {
      username?: unknown;
      exp?: unknown;
    };

    if (typeof decoded.username !== "string") return null;
    if (typeof decoded.exp !== "number") return null;

    if (decoded.exp <= Date.now()) {
      return null;
    }

    if (decoded.username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
      return null;
    }

    return { username: ADMIN_USERNAME };
  } catch {
    return null;
  }
}

function parseCookieHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";");

  for (const part of parts) {
    const [key, ...valueParts] = part.trim().split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export function extractTokenFromRequest(req: Request): string | null {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization");

    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const token = auth.slice(7).trim();

      if (token) return token;
    }
  } catch {
    // ignore
  }

  try {
    const cookieHeader = req.headers.get("cookie");
    const cookieToken = parseCookieHeader(cookieHeader, SESSION_COOKIE_NAME);

    if (cookieToken) return cookieToken;
  } catch {
    // ignore
  }

  return null;
}

export async function getAdminSessionFromRequest(
  req: Request
): Promise<{ username: string } | null> {
  const tokenFromRequest = extractTokenFromRequest(req);

  if (tokenFromRequest) {
    const session = await verifyToken(tokenFromRequest);

    if (session) return session;
  }

  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (cookieToken && cookieToken !== tokenFromRequest) {
      const session = await verifyToken(cookieToken);

      if (session) return session;
    }
  } catch {
    // ignore
  }

  return null;
}

export async function getAdminSession(): Promise<{ username: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function deleteAdminSession(_token: string): Promise<void> {
  // No database session to delete because we use signed tokens.
  // Logging out clears the browser cookie/localStorage token.
}