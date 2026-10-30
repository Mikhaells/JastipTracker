import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { getExchangeRate } from "@/lib/exchange";

async function getOrderWithOwnership(orderId: string, userId: string) {
  const result = await queryOne(
    `SELECT o.* FROM "Order" o
     JOIN "Trip" t ON o."tripId" = t."id"
     WHERE o."id" = $1 AND t."userId" = $2`,
    [orderId, userId]
  );
  return result;
}

async function getOrderFull(orderId: string) {
  const order = await queryOne(
    `SELECT o.*, s."name" AS "stopName", s."latitude" AS "stopLatitude", s."longitude" AS "stopLongitude"
     FROM "Order" o
     LEFT JOIN "TripStop" s ON o."stopId" = s."id"
     WHERE o."id" = $1`,
    [orderId]
  );

  if (!order) return null;

  const items = await query(
    `SELECT * FROM "OrderItem" WHERE "orderId" = $1`,
    [orderId]
  );

  const customer = await queryOne(
    `SELECT * FROM "Customer" WHERE "id" = $1`,
    [order.customerId]
  );

  return {
    ...order,
    items,
    customer,
    stop: order.stopId
      ? {
          id: order.stopId,
          name: order.stopName,
          latitude: order.stopLatitude,
          longitude: order.stopLongitude,
        }
      : null,
  };
}

export async function GET(
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

  const full = await getOrderFull(id);
  if (!full) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(full);
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
    const trip = await queryOne<{ status: string }>(
      `SELECT "status" FROM "Trip" WHERE "id" = $1`,
      [order.tripId]
    );

    if (trip?.status !== "PLANNING" && trip?.status !== "ONGOING") {
      return NextResponse.json(
        {
          error:
            "Status order hanya bisa diubah saat trip berstatus Perencanaan atau Berlangsung",
        },
        { status: 400 }
      );
    }

    await query(
      `UPDATE "Order" SET "status" = $1 WHERE "id" = $2`,
      [body.status, id]
    );

    const updated = await getOrderFull(id);
    return NextResponse.json(updated);
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  const set = (column: string, value: unknown) => {
    values.push(value);
    fields.push(`"${column}" = $${values.length}`);
  };

  if (body.customerId !== undefined) {
    const customerCheck = await queryOne<{ id: string }>(
      `SELECT "id" FROM "Customer" WHERE "id" = $1 AND "userId" = $2`,
      [body.customerId, session.user.id]
    );

    if (!customerCheck) {
      return NextResponse.json(
        { error: "Customer tidak ditemukan" },
        { status: 400 }
      );
    }

    set("customerId", body.customerId);
  }

  if (body.stopId !== undefined) {
    if (body.stopId) {
      const stopCheck = await queryOne<{ id: string }>(
        `SELECT "id" FROM "TripStop" WHERE "id" = $1 AND "tripId" = $2`,
        [body.stopId, order.tripId]
      );

      if (!stopCheck) {
        return NextResponse.json(
          { error: "Tempat tidak ditemukan pada trip ini" },
          { status: 400 }
        );
      }
    }

    set("stopId", body.stopId || null);
  }

  if (body.notes !== undefined) {
    set("notes", body.notes);
  }

  // Replace items only after all ownership/validation checks have passed.
  if (body.items) {
    await query(`DELETE FROM "OrderItem" WHERE "orderId" = $1`, [id]);

    for (const item of body.items) {
      const rate = await getExchangeRate(item.currency, "IDR");
      const unitPriceIDR = item.unitPriceForeign * rate;
      const totalIDR = unitPriceIDR * (item.quantity || 1);

      await query(
        `INSERT INTO "OrderItem" ("id", "orderId", "itemName", "quantity", "unitPriceForeign",
           "currency", "unitPriceIDR", "totalIDR", "margin", "notes")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          item.itemName,
          item.quantity || 1,
          item.unitPriceForeign,
          item.currency,
          unitPriceIDR,
          totalIDR,
          item.margin || 0,
          item.notes || null,
        ]
      );
    }
  }

  if (fields.length > 0) {
    values.push(id);
    await query(
      `UPDATE "Order" SET ${fields.join(", ")} WHERE "id" = $${values.length}`,
      values
    );
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

  await query(`DELETE FROM "Order" WHERE "id" = $1`, [id]);

  return NextResponse.json({ success: true });
}
