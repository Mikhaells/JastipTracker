import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await query(
    `SELECT c.*, COALESCE(o."orderCount", 0)::int AS "orderCount"
     FROM "Customer" c
     LEFT JOIN (
       SELECT "customerId", COUNT(*) AS "orderCount" FROM "Order" GROUP BY "customerId"
     ) o ON o."customerId" = c."id"
     WHERE c."userId" = $1
     ORDER BY c."createdAt" DESC`,
    [session.user.id]
  );

  const customers = rows.map((row) => {
    const { orderCount, ...customer } = row;
    return {
      ...customer,
      _count: { orders: orderCount as number },
    };
  });

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

  const customer = await query(
    `INSERT INTO "Customer" ("id", "userId", "name", "phone", "email", "notes", "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now())
     RETURNING *`,
    [session.user.id, name, phone || null, email || null, notes || null]
  );

  return NextResponse.json(customer[0]);
}
