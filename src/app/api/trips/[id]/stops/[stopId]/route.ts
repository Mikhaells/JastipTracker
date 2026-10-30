import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

async function verifyTripOwner(tripId: string, userId: string) {
  return queryOne<{ id: string }>(
    `SELECT "id" FROM "Trip" WHERE "id" = $1 AND "userId" = $2`,
    [tripId, userId]
  );
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; stopId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stopId } = await params;
  const body = await req.json();

  const trip = await verifyTripOwner(id, session.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  const stopCheck = await queryOne<{ id: string }>(
    `SELECT "id" FROM "TripStop" WHERE "id" = $1 AND "tripId" = $2`,
    [stopId, id]
  );
  if (!stopCheck) {
    return NextResponse.json({ error: "Stop tidak ditemukan" }, { status: 404 });
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  const set = (column: string, value: unknown) => {
    values.push(value);
    fields.push(`"${column}" = $${values.length}`);
  };

  if (body.name !== undefined) set("name", body.name);
  if (body.latitude !== undefined) set("latitude", body.latitude);
  if (body.longitude !== undefined) set("longitude", body.longitude);
  if (body.orderIndex !== undefined) set("orderIndex", body.orderIndex);

  if (fields.length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
  }

  values.push(stopId);
  const updated = await query(
    `UPDATE "TripStop" SET ${fields.join(", ")} WHERE "id" = $${values.length} RETURNING *`,
    values
  );

  return NextResponse.json(updated[0]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; stopId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stopId } = await params;

  const trip = await verifyTripOwner(id, session.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  const stopCheck = await queryOne<{ id: string }>(
    `SELECT "id" FROM "TripStop" WHERE "id" = $1 AND "tripId" = $2`,
    [stopId, id]
  );
  if (!stopCheck) {
    return NextResponse.json({ error: "Stop tidak ditemukan" }, { status: 404 });
  }

  await query(`UPDATE "Order" SET "stopId" = NULL WHERE "stopId" = $1`, [stopId]);
  await query(`DELETE FROM "TripStop" WHERE "id" = $1`, [stopId]);

  return NextResponse.json({ success: true });
}
