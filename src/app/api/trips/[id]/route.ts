import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const db = await getPool();
  const tripResult = await db
    .request()
    .input("id", id)
    .input("userId", session.user.id)
    .query("SELECT * FROM Trip WHERE id = @id AND userId = @userId");

  const trip = tripResult.recordset[0];
  if (!trip) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  const ordersResult = await db
    .request()
    .input("tripId", id)
    .query(`
      SELECT o.*, c.name AS customerName, c.phone AS customerPhone, c.email AS customerEmail
      FROM [Order] o
      JOIN Customer c ON o.customerId = c.id
      WHERE o.tripId = @tripId
      ORDER BY o.createdAt DESC
    `);

  const orders = [];
  for (const order of ordersResult.recordset) {
    const itemsResult = await db
      .request()
      .input("orderId", order.id)
      .query("SELECT * FROM OrderItem WHERE orderId = @orderId");

    orders.push({
      ...order,
      customer: {
        id: order.customerId,
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
      },
      items: itemsResult.recordset,
    });
  }

  const totalRevenue = orders.reduce(
    (sum: number, o: { items: { totalIDR: number }[] }) => sum + o.items.reduce((s: number, i: { totalIDR: number }) => s + i.totalIDR, 0),
    0
  );
  const totalMargin = orders.reduce(
    (sum: number, o: { items: { margin: number }[] }) => sum + o.items.reduce((s: number, i: { margin: number }) => s + i.margin, 0),
    0
  );

  return NextResponse.json({ ...trip, orders, totalRevenue, totalMargin });
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

  const db = await getPool();
  const tripCheck = await db
    .request()
    .input("id", id)
    .input("userId", session.user.id)
    .query("SELECT id FROM Trip WHERE id = @id AND userId = @userId");

  if (!tripCheck.recordset[0]) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  if (body.status === "COMPLETED") {
    const orders = await db
      .request()
      .input("tripId", id)
      .query("SELECT status FROM [Order] WHERE tripId = @tripId");

    const allDelivered = orders.recordset.every(
      (o: { status: string }) => o.status === "DELIVERED"
    );
    if (!allDelivered) {
      return NextResponse.json(
        { error: "Semua order harus dalam status DELIVERED sebelum trip bisa diselesaikan" },
        { status: 400 }
      );
    }
  }

  const fields: string[] = [];
  const req2 = db.request().input("id", id);

  if (body.name !== undefined) {
    fields.push("name = @name");
    req2.input("name", body.name);
  }
  if (body.country !== undefined) {
    fields.push("country = @country");
    req2.input("country", body.country);
  }
  if (body.startDate !== undefined) {
    fields.push("startDate = @startDate");
    req2.input("startDate", new Date(body.startDate));
  }
  if (body.endDate !== undefined) {
    fields.push("endDate = @endDate");
    req2.input("endDate", body.endDate ? new Date(body.endDate) : null);
  }
  if (body.status !== undefined) {
    fields.push("status = @status");
    req2.input("status", body.status);
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
  }

  await req2.query(`UPDATE Trip SET ${fields.join(", ")} WHERE id = @id`);

  const updated = await db
    .request()
    .input("id", id)
    .query("SELECT * FROM Trip WHERE id = @id");

  return NextResponse.json(updated.recordset[0]);
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

  const db = await getPool();
  const tripCheck = await db
    .request()
    .input("id", id)
    .input("userId", session.user.id)
    .query("SELECT id FROM Trip WHERE id = @id AND userId = @userId");

  if (!tripCheck.recordset[0]) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  await db.request().input("id", id).query("DELETE FROM Trip WHERE id = @id");

  return NextResponse.json({ success: true });
}
