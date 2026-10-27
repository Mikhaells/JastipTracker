import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

async function verifyTripOwner(
  db: Awaited<ReturnType<typeof getPool>>,
  tripId: string,
  userId: string
) {
  const res = await db
    .request()
    .input("id", tripId)
    .input("userId", userId)
    .query("SELECT id FROM Trip WHERE id = @id AND userId = @userId");
  return res.recordset[0];
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

  const db = await getPool();
  const trip = await verifyTripOwner(db, id, session.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  const stopCheck = await db
    .request()
    .input("stopId", stopId)
    .input("tripId", id)
    .query("SELECT id FROM TripStop WHERE id = @stopId AND tripId = @tripId");
  if (!stopCheck.recordset[0]) {
    return NextResponse.json({ error: "Stop tidak ditemukan" }, { status: 404 });
  }

  const fields: string[] = [];
  const req2 = db.request().input("stopId", stopId);

  if (body.name !== undefined) {
    fields.push("name = @name");
    req2.input("name", body.name);
  }
  if (body.latitude !== undefined) {
    fields.push("latitude = @latitude");
    req2.input("latitude", body.latitude);
  }
  if (body.longitude !== undefined) {
    fields.push("longitude = @longitude");
    req2.input("longitude", body.longitude);
  }
  if (body.orderIndex !== undefined) {
    fields.push("orderIndex = @orderIndex");
    req2.input("orderIndex", body.orderIndex);
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
  }

  await req2.query(`UPDATE TripStop SET ${fields.join(", ")} WHERE id = @stopId`);

  const updated = await db
    .request()
    .input("stopId", stopId)
    .query("SELECT * FROM TripStop WHERE id = @stopId");

  return NextResponse.json(updated.recordset[0]);
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
  const db = await getPool();
  const trip = await verifyTripOwner(db, id, session.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  const stopCheck = await db
    .request()
    .input("stopId", stopId)
    .input("tripId", id)
    .query("SELECT id FROM TripStop WHERE id = @stopId AND tripId = @tripId");
  if (!stopCheck.recordset[0]) {
    return NextResponse.json({ error: "Stop tidak ditemukan" }, { status: 404 });
  }

  await db
    .request()
    .input("stopId", stopId)
    .query("UPDATE [Order] SET stopId = NULL WHERE stopId = @stopId");

  await db.request().input("stopId", stopId).query("DELETE FROM TripStop WHERE id = @stopId");

  return NextResponse.json({ success: true });
}
