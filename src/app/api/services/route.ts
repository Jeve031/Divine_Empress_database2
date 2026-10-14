import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { asc } from "drizzle-orm";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { defaultPriceCategories } from "@/lib/defaultServices";

export async function GET() {
  try {
    // Check if services exist
    let allServices = await db
      .select()
      .from(services)
      .orderBy(asc(services.categoryOrder), asc(services.sortOrder), asc(services.id));

    // Auto-seed if table is empty
    if (allServices.length === 0) {
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

      if (inserts.length > 0) {
        await db.insert(services).values(inserts);
        allServices = await db
          .select()
          .from(services)
          .orderBy(asc(services.categoryOrder), asc(services.sortOrder), asc(services.id));
      }
    }

    // Group services by category for the menu presentation
    const categoryMap = new Map<
      string,
      {
        title: string;
        categoryOrder: number;
        items: {
          id: number;
          name: string;
          price: string;
          isAvailable: boolean;
          sortOrder: number;
        }[];
      }
    >();

    for (const s of allServices) {
      if (!categoryMap.has(s.category)) {
        categoryMap.set(s.category, {
          title: s.category,
          categoryOrder: s.categoryOrder,
          items: [],
        });
      }
      categoryMap.get(s.category)!.items.push({
        id: s.id,
        name: s.name,
        price: s.price,
        isAvailable: s.isAvailable,
        sortOrder: s.sortOrder,
      });
    }

    const categories = Array.from(categoryMap.values()).sort(
      (a, b) => a.categoryOrder - b.categoryOrder
    );

    return NextResponse.json({
      success: true,
      categories,
      rawServices: allServices,
    });
  } catch (err: unknown) {
    console.error("GET /api/services error:", err);
    // Fallback gracefully to default catalog if DB error during initial setup
    return NextResponse.json({
      success: false,
      categories: defaultPriceCategories.map((c, i) => ({
        title: c.title,
        categoryOrder: i,
        items: c.items.map((it, idx) => ({
          id: -(i * 100 + idx + 1),
          name: it.name,
          price: it.price,
          isAvailable: true,
          sortOrder: idx,
        })),
      })),
      error: err instanceof Error ? err.message : "Error retrieving services",
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in as Storm." }, { status: 401 });
    }

    const body = await req.json();
    let { name, price, category, categoryOrder, sortOrder } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Service name, price, and category are required." },
        { status: 400 }
      );
    }

    name = String(name).trim();
    category = String(category).trim();
    price = String(price).trim();

    // Standardize price if user just typed a number like "450"
    if (!price.toUpperCase().startsWith("R") && !price.startsWith("\$") && !price.startsWith("£")) {
      price = `R${price}`;
    }

    // Determine categoryOrder / sortOrder if not provided
    if (categoryOrder === undefined || categoryOrder === null) {
      const { eq } = await import("drizzle-orm");
      // If category already exists, reuse its order; otherwise append as new category
      const sameCat = await db
        .select({ categoryOrder: services.categoryOrder })
        .from(services)
        .where(eq(services.category, category))
        .limit(1);
      if (sameCat.length > 0) {
        categoryOrder = sameCat[0].categoryOrder;
      } else {
        const allOrders = await db
          .select({ categoryOrder: services.categoryOrder })
          .from(services);
        const maxOrder =
          allOrders.length > 0 ? Math.max(...allOrders.map((r) => r.categoryOrder)) : -1;
        categoryOrder = maxOrder + 1;
      }
    }

    // Determine sortOrder if not provided — append to end of its category
    if (sortOrder === undefined || sortOrder === null) {
      const { eq } = await import("drizzle-orm");
      const inCat = await db
        .select({ sortOrder: services.sortOrder })
        .from(services)
        .where(eq(services.category, category));
      const maxSort =
        inCat.length > 0 ? Math.max(...inCat.map((r) => r.sortOrder)) : -1;
      sortOrder = maxSort + 1;
    }

    const [inserted] = await db
      .insert(services)
      .values({
        name,
        price,
        category,
        categoryOrder: Number(categoryOrder) || 0,
        sortOrder: Number(sortOrder) || 0,
        isAvailable: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      service: inserted,
      message: `Added service "${name}" to ${category}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error adding service";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in as Storm." }, { status: 401 });
    }

    const body = await req.json();
    let { id, name, price } = body; 

    if (!id) {
      return NextResponse.json({ error: "Missing required Service ID." }, { status: 400 });
    }

    const { eq } = await import("drizzle-orm");

    // Standardize price format to preserve the currency symbol prefix structure
    if (price) {
      price = String(price).trim();
      if (!price.toUpperCase().startsWith("R") && !price.startsWith("\$") && !price.startsWith("£")) {
        price = `R${price}`;
      }
    }

    // Update query mapping to supply all four context parameters (\$1, \$2, \$3, \$4)
    const [updated] = await db
      .update(services)
      .set({
        name: name ? String(name).trim() : undefined,
        price: price,
        updatedAt: new Date(), 
      })
      .where(eq(services.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      service: updated,
      message: `Successfully updated service entry`,
    });
  } catch (err: unknown) {
    console.error("PUT /api/services error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error updating service" },
      { status: 500 }
    );
  }
}
