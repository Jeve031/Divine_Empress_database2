import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { defaultPriceCategories } from "@/lib/defaultServices";

export async function POST(req: Request) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in as Storm." }, { status: 401 });
    }

    // Delete existing services
    await db.delete(services);

    // Re-insert default categories
    const inserts = [];
    let catOrder = 0;
    for (const cat of defaultPriceCategories) {
      let sortOrder = 0;
      for (const item of cat.items) {
        inserts.push({
          category: cat.title,
          name: item.name,
          price: item.price,
          categoryOrder: catOrder,
          sortOrder: sortOrder++,
          isAvailable: true,
        });
      }
      catOrder++;
    }

    await db.insert(services).values(inserts);

    return NextResponse.json({
      success: true,
      message: "Services successfully reset to default menu",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error resetting services";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
