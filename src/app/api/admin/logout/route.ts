import { NextResponse } from "next/server";
import {
  deleteAdminSession,
  extractTokenFromRequest,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // Token may come via Authorization header (iframe/embed) or cookie
    let token = extractTokenFromRequest(req);

    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
      } catch {
        /* ignore */
      }
    }

    if (token) {
      await deleteAdminSession(token);
    }

    const res = NextResponse.json({ success: true, message: "Logged out successfully" });
    // Clear cookie on response so browser drops it
    res.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error logging out";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
