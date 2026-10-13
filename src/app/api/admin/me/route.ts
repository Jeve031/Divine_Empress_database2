import { NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({ authenticated: true, user: session });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error checking session";
    return NextResponse.json({ authenticated: false, error: message }, { status: 500 });
  }
}
