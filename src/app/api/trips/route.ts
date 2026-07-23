import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getPool();
  const result = await db
    .request()
    .input("userId", session.user.id)
    .query(`
      SELECT t.*, (SELECT COUNT(*) FROM [Order] o WHERE o.tripId = t.id) AS orderCount
      FROM Trip t
      WHERE t.userId = @userId
      ORDER BY t.createdAt DESC
    `);

  const trips = result.recordset.map((t: Record<string, unknown>) => ({
    ...t,
    _count: { orders: t.orderCount },
    orderCount: undefined,
  }));

  return NextResponse.json(trips);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, country, startDate, endDate } = await req.json();

  if (!name || !country || !startDate) {
    return NextResponse.json(
      { error: "Nama trip, negara, dan tanggal harus diisi" },
      { status: 400 }
    );
  }

  const db = await getPool();
  const result = await db
    .request()
    .input("userId", session.user.id)
    .input("name", name)
    .input("country", country)
    .input("startDate", new Date(startDate))
    .input("endDate", endDate ? new Date(endDate) : null)
    .query(`
      INSERT INTO Trip (id, userId, name, country, startDate, endDate, status, createdAt)
      OUTPUT INSERTED.*
      VALUES (NEWID(), @userId, @name, @country, @startDate, @endDate, 'PLANNING', GETDATE())
    `);

  return NextResponse.json(result.recordset[0]);
}
