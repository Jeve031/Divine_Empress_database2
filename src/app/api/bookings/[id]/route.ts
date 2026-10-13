import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSessionFromRequest } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in as Storm." }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id, 10);
    const body = await req.json();

    const [updated] = await db
      .update(bookings)
      .set({ status: body.status })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({ success: true, booking: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in as Storm." }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id, 10);

    await db.delete(bookings).where(eq(bookings.id, bookingId));
    return NextResponse.json({ success: true, message: "Booking removed" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
