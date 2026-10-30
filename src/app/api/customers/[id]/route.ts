import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const customer = await queryOne(
    `SELECT * FROM "Customer" WHERE "id" = $1 AND "userId" = $2`,
    [id, session.user.id]
  );

  if (!customer) {
    return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
  }

  const orderRows = await query(
    `SELECT o.*, t."name" AS "tripName", t."country" AS "tripCountry"
     FROM "Order" o
     JOIN "Trip" t ON o."tripId" = t."id"
     WHERE o."customerId" = $1
     ORDER BY o."createdAt" DESC`,
    [id]
  );

  const orders = [];
  for (const order of orderRows) {
    const items = await query(
      `SELECT * FROM "OrderItem" WHERE "orderId" = $1`,
      [order.id]
    );

    orders.push({
      ...order,
      trip: {
        id: order.tripId,
        name: order.tripName,
        country: order.tripCountry,
      },
      items,
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

  const customerCheck = await queryOne<{ id: string }>(
    `SELECT "id" FROM "Customer" WHERE "id" = $1 AND "userId" = $2`,
    [id, session.user.id]
  );

  if (!customerCheck) {
    return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  const set = (column: string, value: unknown) => {
    values.push(value);
    fields.push(`"${column}" = $${values.length}`);
  };

  if (body.name !== undefined) set("name", body.name);
  if (body.phone !== undefined) set("phone", body.phone);
  if (body.email !== undefined) set("email", body.email);
  if (body.notes !== undefined) set("notes", body.notes);

  if (fields.length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
  }

  values.push(id);
  const updated = await query(
    `UPDATE "Customer" SET ${fields.join(", ")} WHERE "id" = $${values.length} RETURNING *`,
    values
  );

  return NextResponse.json(updated[0]);
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

  const customerCheck = await queryOne<{ id: string }>(
    `SELECT "id" FROM "Customer" WHERE "id" = $1 AND "userId" = $2`,
    [id, session.user.id]
  );

  if (!customerCheck) {
    return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
  }

  const orderCount = await queryOne<{ orderCount: number }>(
    `SELECT COUNT(*)::int AS "orderCount" FROM "Order" WHERE "customerId" = $1`,
    [id]
  );

  const count = orderCount?.orderCount ?? 0;
  if (count > 0) {
    return NextResponse.json(
      {
        error: `Pelanggan tidak bisa dihapus karena masih memiliki ${count} order. Hapus order terkait terlebih dahulu.`,
      },
      { status: 400 }
    );
  }

  await query(`DELETE FROM "Customer" WHERE "id" = $1`, [id]);

  return NextResponse.json({ success: true });
}
