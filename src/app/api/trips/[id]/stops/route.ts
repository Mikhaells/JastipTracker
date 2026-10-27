import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

async function verifyTripOwner(db: Awaited<ReturnType<typeof getPool>>, tripId: string, userId: string) {
  const res = await db
    .request()
    .input("id", tripId)
    .input("userId", userId)
    .query("SELECT id FROM Trip WHERE id = @id AND userId = @userId");
  return res.recordset[0];
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
  const db = await getPool();
  const trip = await verifyTripOwner(db, id, session.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  const result = await db
    .request()
    .input("tripId", id)
    .query(
      "SELECT * FROM TripStop WHERE tripId = @tripId ORDER BY orderIndex ASC, createdAt ASC"
    );

  return NextResponse.json(result.recordset);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, latitude, longitude } = await req.json();

  if (!name || latitude == null || longitude == null) {
    return NextResponse.json(
      { error: "Nama, latitude, dan longitude harus diisi" },
      { status: 400 }
    );
  }

  const db = await getPool();
  const trip = await verifyTripOwner(db, id, session.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  const maxResult = await db
    .request()
    .input("tripId", id)
    .query("SELECT ISNULL(MAX(orderIndex), -1) AS maxIndex FROM TripStop WHERE tripId = @tripId");
  const nextIndex = (maxResult.recordset[0] as { maxIndex: number }).maxIndex + 1;

  const result = await db
    .request()
    .input("tripId", id)
    .input("name", name)
    .input("latitude", latitude)
    .input("longitude", longitude)
    .input("orderIndex", nextIndex)
    .query(`
      INSERT INTO TripStop (id, tripId, name, latitude, longitude, orderIndex, createdAt)
      OUTPUT INSERTED.*
      VALUES (NEWID(), @tripId, @name, @latitude, @longitude, @orderIndex, GETDATE())
    `);

  return NextResponse.json(result.recordset[0]);
}
