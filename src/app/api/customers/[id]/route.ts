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
  const customerResult = await db
    .request()
    .input("id", id)
    .input("userId", session.user.id)
    .query("SELECT * FROM Customer WHERE id = @id AND userId = @userId");

  const customer = customerResult.recordset[0];
  if (!customer) {
    return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
  }

  const ordersResult = await db
    .request()
    .input("customerId", id)
    .query(`
      SELECT o.*, t.name AS tripName, t.country AS tripCountry
      FROM [Order] o
      JOIN Trip t ON o.tripId = t.id
      WHERE o.customerId = @customerId
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
      trip: {
        id: order.tripId,
        name: order.tripName,
        country: order.tripCountry,
      },
      items: itemsResult.recordset,
    });
  }

  return NextResponse.json({ ...customer, orders });
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
  const customerCheck = await db
    .request()
    .input("id", id)
    .input("userId", session.user.id)
    .query("SELECT id FROM Customer WHERE id = @id AND userId = @userId");

  if (!customerCheck.recordset[0]) {
    return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
  }

  const fields: string[] = [];
  const req2 = db.request().input("id", id);

  if (body.name !== undefined) {
    fields.push("name = @name");
    req2.input("name", body.name);
  }
  if (body.phone !== undefined) {
    fields.push("phone = @phone");
    req2.input("phone", body.phone);
  }
  if (body.email !== undefined) {
    fields.push("email = @email");
    req2.input("email", body.email);
  }
  if (body.notes !== undefined) {
    fields.push("notes = @notes");
    req2.input("notes", body.notes);
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
  }

  await req2.query(`UPDATE Customer SET ${fields.join(", ")} WHERE id = @id`);

  const updated = await db
    .request()
    .input("id", id)
    .query("SELECT * FROM Customer WHERE id = @id");

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
  const customerCheck = await db
    .request()
    .input("id", id)
    .input("userId", session.user.id)
    .query("SELECT id FROM Customer WHERE id = @id AND userId = @userId");

  if (!customerCheck.recordset[0]) {
    return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
  }

  await db.request().input("id", id).query("DELETE FROM Customer WHERE id = @id");

  return NextResponse.json({ success: true });
}
