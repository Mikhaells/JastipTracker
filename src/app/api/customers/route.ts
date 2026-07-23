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
      SELECT c.*, (SELECT COUNT(*) FROM [Order] o WHERE o.customerId = c.id) AS orderCount
      FROM Customer c
      WHERE c.userId = @userId
      ORDER BY c.createdAt DESC
    `);

  const customers = result.recordset.map((c: Record<string, unknown>) => ({
    ...c,
    _count: { orders: c.orderCount },
    orderCount: undefined,
  }));

  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone, email, notes } = await req.json();

  if (!name) {
    return NextResponse.json(
      { error: "Nama customer harus diisi" },
      { status: 400 }
    );
  }

  const db = await getPool();
  const result = await db
    .request()
    .input("userId", session.user.id)
    .input("name", name)
    .input("phone", phone || null)
    .input("email", email || null)
    .input("notes", notes || null)
    .query(`
      INSERT INTO Customer (id, userId, name, phone, email, notes, createdAt)
      OUTPUT INSERTED.*
      VALUES (NEWID(), @userId, @name, @phone, @email, @notes, GETDATE())
    `);

  return NextResponse.json(result.recordset[0]);
}
