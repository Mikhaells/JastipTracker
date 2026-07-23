import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { getExchangeRate } from "@/lib/exchange";

async function getOrderWithOwnership(orderId: string, userId: string) {
  const db = await getPool();
  const result = await db
    .request()
    .input("id", orderId)
    .input("userId", userId)
    .query(`
      SELECT o.* FROM [Order] o
      JOIN Trip t ON o.tripId = t.id
      WHERE o.id = @id AND t.userId = @userId
    `);
  return result.recordset[0];
}

async function getOrderFull(orderId: string) {
  const db = await getPool();
  const orderResult = await db
    .request()
    .input("id", orderId)
    .query("SELECT * FROM [Order] WHERE id = @id");

  const order = orderResult.recordset[0];
  if (!order) return null;

  const itemsResult = await db
    .request()
    .input("orderId", orderId)
    .query("SELECT * FROM OrderItem WHERE orderId = @orderId");

  const customerResult = await db
    .request()
    .input("customerId", order.customerId)
    .query("SELECT * FROM Customer WHERE id = @customerId");

  return {
    ...order,
    items: itemsResult.recordset,
    customer: customerResult.recordset[0],
  };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const order = await getOrderWithOwnership(id, session.user.id);
  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  if (body.status) {
    const db = await getPool();
    const tripResult = await db
      .request()
      .input("tripId", order.tripId)
      .query("SELECT status FROM Trip WHERE id = @tripId");

    if (tripResult.recordset[0]?.status !== "ONGOING") {
      return NextResponse.json(
        { error: "Status order hanya bisa diubah saat trip sedang berlangsung" },
        { status: 400 }
      );
    }

    await db
      .request()
      .input("id", id)
      .input("status", body.status)
      .query("UPDATE [Order] SET status = @status WHERE id = @id");

    const updated = await getOrderFull(id);
    return NextResponse.json(updated);
  }

  if (body.items) {
    const db = await getPool();
    await db.request().input("orderId", id).query("DELETE FROM OrderItem WHERE orderId = @orderId");

    for (const item of body.items) {
      const rate = await getExchangeRate(item.currency, "IDR");
      const unitPriceIDR = item.unitPriceForeign * rate;
      const totalIDR = unitPriceIDR * (item.quantity || 1);

      await db
        .request()
        .input("orderId", id)
        .input("itemName", item.itemName)
        .input("quantity", item.quantity || 1)
        .input("unitPriceForeign", item.unitPriceForeign)
        .input("currency", item.currency)
        .input("unitPriceIDR", unitPriceIDR)
        .input("totalIDR", totalIDR)
        .input("margin", item.margin || 0)
        .input("notes", item.notes || null)
        .query(`
          INSERT INTO OrderItem (id, orderId, itemName, quantity, unitPriceForeign, currency, unitPriceIDR, totalIDR, margin, notes)
          VALUES (NEWID(), @orderId, @itemName, @quantity, @unitPriceForeign, @currency, @unitPriceIDR, @totalIDR, @margin, @notes)
        `);
    }
  }

  const fields: string[] = [];
  const db = await getPool();
  const req2 = db.request().input("id", id);

  if (body.notes !== undefined) {
    fields.push("notes = @notes");
    req2.input("notes", body.notes);
  }
  if (body.receiptUrl !== undefined) {
    fields.push("receiptUrl = @receiptUrl");
    req2.input("receiptUrl", body.receiptUrl);
  }

  if (fields.length > 0) {
    await req2.query(`UPDATE [Order] SET ${fields.join(", ")} WHERE id = @id`);
  }

  const updated = await getOrderFull(id);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await getOrderWithOwnership(id, session.user.id);
  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  const db = await getPool();
  await db.request().input("id", id).query("DELETE FROM [Order] WHERE id = @id");

  return NextResponse.json({ success: true });
}
