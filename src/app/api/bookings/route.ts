import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getAdminSessionFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in as Storm." }, { status: 401 });
    }

    const allBookings = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));

    return NextResponse.json({ success: true, bookings: allBookings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching bookings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientName, phone, email, serviceName, bookingDate, bookingTime, notes } = body;

    if (!clientName || !phone || !serviceName || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: "Please fill in your name, phone number, service, date, and preferred time." },
        { status: 400 }
      );
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        clientName: String(clientName).trim(),
        phone: String(phone).trim(),
        email: email ? String(email).trim() : null,
        serviceName: String(serviceName).trim(),
        bookingDate: String(bookingDate).trim(),
        bookingTime: String(bookingTime).trim(),
        notes: notes ? String(notes).trim() : null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: "Your appointment request has been submitted to Storm! She will confirm shortly.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error submitting booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
