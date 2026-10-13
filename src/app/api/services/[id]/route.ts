import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSessionFromRequest } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in as Storm." }, { status: 401 });
    }

    const { id } = await params;
    const serviceId = parseInt(id, 10);
    if (isNaN(serviceId)) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
    }

    const body = await req.json();
    const updateData: {
      name?: string;
      price?: string;
      category?: string;
      categoryOrder?: number;
      sortOrder?: number;
      isAvailable?: boolean;
      updatedAt?: Date;
    } = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.price !== undefined) {
      let p = String(body.price).trim();
      if (!p.toUpperCase().startsWith("R") && !p.startsWith("$") && !p.startsWith("£")) {
        p = `R${p}`;
      }
      updateData.price = p;
    }
    if (body.category !== undefined) updateData.category = String(body.category).trim();
    if (body.categoryOrder !== undefined) updateData.categoryOrder = Number(body.categoryOrder);
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder);
    if (body.isAvailable !== undefined) updateData.isAvailable = Boolean(body.isAvailable);

    const [updated] = await db
      .update(services)
      .set(updateData)
      .where(eq(services.id, serviceId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      service: updated,
      message: `Updated service "${updated.name}" successfully`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating service";
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
    const serviceId = parseInt(id, 10);
    if (isNaN(serviceId)) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(services)
      .where(eq(services.id, serviceId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      service: deleted,
      message: `Deleted "${deleted.name}" successfully`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting service";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
