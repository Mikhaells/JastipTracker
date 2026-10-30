import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { getExchangeRate } from "@/lib/exchange";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId, customerId, stopId, notes, items } = await req.json();

  if (!tripId || !customerId || !items?.length) {
    return NextResponse.json(
      { error: "Trip, customer, dan minimal 1 item harus diisi" },
      { status: 400 }
    );
  }

  const tripCheck = await queryOne<{ id: string }>(
    `SELECT "id" FROM "Trip" WHERE "id" = $1 AND "userId" = $2`,
    [tripId, session.user.id]
  );

  if (!tripCheck) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  if (stopId) {
    const stopCheck = await queryOne<{ id: string }>(
      `SELECT "id" FROM "TripStop" WHERE "id" = $1 AND "tripId" = $2`,
      [stopId, tripId]
    );

    if (!stopCheck) {
      return NextResponse.json(
        { error: "Tempat tidak ditemukan pada trip ini" },
        { status: 400 }
      );
    }
  }

  const processedItems = [];
  for (const item of items) {
    const rate = await getExchangeRate(item.currency, "IDR");
    const unitPriceIDR = item.unitPriceForeign * rate;
    const totalIDR = unitPriceIDR * (item.quantity || 1);
    const margin = item.margin || 0;

    processedItems.push({
      itemName: item.itemName,
      quantity: item.quantity || 1,
      unitPriceForeign: item.unitPriceForeign,
      currency: item.currency,
      unitPriceIDR,
      totalIDR,
      margin,
      notes: item.notes || null,
    });
  }

  const order = await queryOne(
    `INSERT INTO "Order" ("id", "tripId", "customerId", "stopId", "notes", "status", "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PENDING', now())
     RETURNING *`,
    [tripId, customerId, stopId || null, notes || null]
  );

  if (!order) {
    return NextResponse.json({ error: "Gagal membuat order" }, { status: 500 });
  }

  for (const item of processedItems) {
    await query(
      `INSERT INTO "OrderItem" ("id", "orderId", "itemName", "quantity", "unitPriceForeign",
         "currency", "unitPriceIDR", "totalIDR", "margin", "notes")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        order.id,
        item.itemName,
        item.quantity,
        item.unitPriceForeign,
        item.currency,
        item.unitPriceIDR,
        item.totalIDR,
        item.margin,
        item.notes,
      ]
    );
  }

  const orderItems = await query(
    `SELECT * FROM "OrderItem" WHERE "orderId" = $1`,
    [order.id]
  );

  const customer = await queryOne(
    `SELECT * FROM "Customer" WHERE "id" = $1`,
    [customerId]
  );

  const stop = order.stopId
    ? await queryOne(`SELECT * FROM "TripStop" WHERE "id" = $1`, [order.stopId])
    : undefined;

  return NextResponse.json({
    ...order,
    items: orderItems,
    customer,
    stop: stop ?? null,
  });
}
