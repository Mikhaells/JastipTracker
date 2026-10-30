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

  const trip = await queryOne(
    `SELECT * FROM "Trip" WHERE "id" = $1 AND "userId" = $2`,
    [id, session.user.id]
  );

  if (!trip) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  const orderRows = await query(
    `SELECT o.*, c."name" AS "customerName", c."phone" AS "customerPhone", c."email" AS "customerEmail",
       s."name" AS "stopName", s."latitude" AS "stopLatitude", s."longitude" AS "stopLongitude"
     FROM "Order" o
     JOIN "Customer" c ON o."customerId" = c."id"
     LEFT JOIN "TripStop" s ON o."stopId" = s."id"
     WHERE o."tripId" = $1
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
      stop: order.stopId
        ? {
            id: order.stopId,
            name: order.stopName,
            latitude: order.stopLatitude,
            longitude: order.stopLongitude,
          }
        : null,
      customer: {
        id: order.customerId,
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
      },
      items,
    });
  }

  const totalRevenue = orders.reduce(
    (sum, o) => sum + o.items.reduce((s: number, i) => s + Number(i.totalIDR), 0),
    0
  );
  const totalMargin = orders.reduce(
    (sum, o) => sum + o.items.reduce((s: number, i) => s + Number(i.margin), 0),
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

  const tripCheck = await queryOne<{ id: string }>(
    `SELECT "id" FROM "Trip" WHERE "id" = $1 AND "userId" = $2`,
    [id, session.user.id]
  );

  if (!tripCheck) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  if (body.status === "COMPLETED") {
    const pendingOrders = await query(
      `SELECT "id" FROM "Order" WHERE "tripId" = $1 AND "status" IN ('PENDING', 'ORDERED')`,
      [id]
    );

    if (pendingOrders.length > 0) {
      return NextResponse.json(
        {
          error:
            "Trip hanya bisa diselesaikan jika tidak ada order berstatus Menunggu atau Dipesan",
        },
        { status: 400 }
      );
    }
  }

  if (body.status === "CANCELLED") {
    const paidOrders = await query(
      `SELECT "id" FROM "Order" WHERE "tripId" = $1 AND "status" = 'PAID'`,
      [id]
    );

    if (paidOrders.length > 0) {
      return NextResponse.json(
        { error: "Trip tidak bisa dibatalkan karena masih ada order yang sudah dibayar" },
        { status: 400 }
      );
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  const set = (column: string, value: unknown) => {
    values.push(value);
    fields.push(`"${column}" = $${values.length}`);
  };

  if (body.name !== undefined) set("name", body.name);
  if (body.country !== undefined) set("country", body.country);
  if (body.startDate !== undefined) set("startDate", new Date(body.startDate));
  if (body.endDate !== undefined) {
    set("endDate", body.endDate ? new Date(body.endDate) : null);
  }
  if (body.status !== undefined) set("status", body.status);

  if (fields.length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
  }

  values.push(id);
  const updated = await query(
    `UPDATE "Trip" SET ${fields.join(", ")} WHERE "id" = $${values.length} RETURNING *`,
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

  const tripCheck = await queryOne<{ id: string }>(
    `SELECT "id" FROM "Trip" WHERE "id" = $1 AND "userId" = $2`,
    [id, session.user.id]
  );

  if (!tripCheck) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  await query(`UPDATE "Order" SET "stopId" = NULL WHERE "tripId" = $1`, [id]);
  await query(`DELETE FROM "Trip" WHERE "id" = $1`, [id]);

  return NextResponse.json({ success: true });
}
