import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

async function verifyTripOwner(tripId: string, userId: string) {
  return queryOne<{ id: string }>(
    `SELECT "id" FROM "Trip" WHERE "id" = $1 AND "userId" = $2`,
    [tripId, userId]
  );
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
  const trip = await verifyTripOwner(id, session.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  const stops = await query(
    `SELECT * FROM "TripStop" WHERE "tripId" = $1 ORDER BY "orderIndex" ASC, "createdAt" ASC`,
    [id]
  );

  return NextResponse.json(stops);
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

  const trip = await verifyTripOwner(id, session.user.id);
  if (!trip) {
    return NextResponse.json({ error: "Trip tidak ditemukan" }, { status: 404 });
  }

  const maxResult = await queryOne<{ maxIndex: number }>(
    `SELECT COALESCE(MAX("orderIndex"), -1) AS "maxIndex" FROM "TripStop" WHERE "tripId" = $1`,
    [id]
  );
  const nextIndex = (maxResult?.maxIndex ?? -1) + 1;

  const stop = await query(
    `INSERT INTO "TripStop" ("id", "tripId", "name", "latitude", "longitude", "orderIndex", "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now())
     RETURNING *`,
    [id, name, latitude, longitude, nextIndex]
  );

  return NextResponse.json(stop[0]);
}
