import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { getExchangeRate } from "@/lib/exchange";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId, customerId, notes, items } = await req.json();

  if (!tripId || !customerId || !items?.length) {
    return NextResponse.json(
      { error: "Trip, customer, dan minimal 1 item harus diisi" },
      { status: 400 }
    );
  }

  const db = await getPool();
  const tripCheck = await db
    .request()
    .input("tripId", tripId)
    .input("userId", session.user.id)
    .query("SELECT id FROM Trip WHERE id = @tripId AND userId = @userId");

  if (!tripCheck.recordset[0]) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
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

  const orderResult = await db
    .request()
    .input("tripId", tripId)
    .input("customerId", customerId)
    .input("notes", notes || null)
    .query(`
      INSERT INTO [Order] (id, tripId, customerId, notes, status, createdAt)
      OUTPUT INSERTED.*
      VALUES (NEWID(), @tripId, @customerId, @notes, 'PENDING', GETDATE())
    `);

  const order = orderResult.recordset[0];

  for (const item of processedItems) {
    await db
      .request()
      .input("orderId", order.id)
      .input("itemName", item.itemName)
      .input("quantity", item.quantity)
      .input("unitPriceForeign", item.unitPriceForeign)
      .input("currency", item.currency)
      .input("unitPriceIDR", item.unitPriceIDR)
      .input("totalIDR", item.totalIDR)
      .input("margin", item.margin)
      .input("notes", item.notes)
      .query(`
        INSERT INTO OrderItem (id, orderId, itemName, quantity, unitPriceForeign, currency, unitPriceIDR, totalIDR, margin, notes)
        VALUES (NEWID(), @orderId, @itemName, @quantity, @unitPriceForeign, @currency, @unitPriceIDR, @totalIDR, @margin, @notes)
      `);
  }

  const itemsResult = await db
    .request()
    .input("orderId", order.id)
    .query("SELECT * FROM OrderItem WHERE orderId = @orderId");

  const customerResult = await db
    .request()
    .input("customerId", customerId)
    .query("SELECT * FROM Customer WHERE id = @customerId");

  return NextResponse.json({
    ...order,
    items: itemsResult.recordset,
    customer: customerResult.recordset[0],
  });
}
