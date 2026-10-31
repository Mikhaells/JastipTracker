import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await query(
    `SELECT t.*, COALESCE(o."orderCount", 0)::int AS "orderCount"
     FROM "Trip" t
     LEFT JOIN (
       SELECT "tripId", COUNT(*) AS "orderCount" FROM "Order" GROUP BY "tripId"
     ) o ON o."tripId" = t."id"
     WHERE t."userId" = $1
     ORDER BY t."createdAt" DESC`,
    [session.user.id]
  );

  const trips = rows.map((row) => {
    const { orderCount, ...trip } = row;
    return {
      ...trip,
      _count: { orders: orderCount as number },
    };
  });

  return NextResponse.json(trips);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, country, startDate, endDate } = await req.json();
  const destination = typeof country === "string" ? country.trim() : "";

  if (!name || !destination || !startDate) {
    return NextResponse.json(
      { error: "Nama trip, tujuan, dan tanggal harus diisi" },
      { status: 400 }
    );
  }

  const trip = await query(
    `INSERT INTO "Trip" ("id", "userId", "name", "country", "startDate", "endDate", "status", "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'PLANNING', now())
     RETURNING *`,
    [
      session.user.id,
      name,
      destination,
      new Date(startDate),
      endDate ? new Date(endDate) : null,
    ]
  );

  return NextResponse.json(trip[0]);
}
