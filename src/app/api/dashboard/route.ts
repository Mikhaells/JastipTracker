import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [totalTrips, activeTrips, totalOrders, totalCustomers, revenueAgg, marginAgg] =
    await Promise.all([
      query<{ cnt: number }>(
        `SELECT COUNT(*)::int AS "cnt" FROM "Trip" WHERE "userId" = $1`,
        [userId]
      ),
      query<{ cnt: number }>(
        `SELECT COUNT(*)::int AS "cnt" FROM "Trip" WHERE "userId" = $1 AND "status" = 'ONGOING'`,
        [userId]
      ),
      query<{ cnt: number }>(
        `SELECT COUNT(*)::int AS "cnt" FROM "Order" o
         JOIN "Trip" t ON o."tripId" = t."id"
         WHERE t."userId" = $1`,
        [userId]
      ),
      query<{ cnt: number }>(
        `SELECT COUNT(*)::int AS "cnt" FROM "Customer" WHERE "userId" = $1`,
        [userId]
      ),
      query<{ total: number }>(
        `SELECT COALESCE(SUM(oi."totalIDR"), 0) AS "total"
         FROM "OrderItem" oi
         JOIN "Order" o ON oi."orderId" = o."id"
         JOIN "Trip" t ON o."tripId" = t."id"
         WHERE t."userId" = $1`,
        [userId]
      ),
      query<{ total: number }>(
        `SELECT COALESCE(SUM(oi."margin"), 0) AS "total"
         FROM "OrderItem" oi
         JOIN "Order" o ON oi."orderId" = o."id"
         JOIN "Trip" t ON o."tripId" = t."id"
         WHERE t."userId" = $1`,
        [userId]
      ),
    ]);

  const recentTrips = await query(
    `SELECT t.*, COALESCE(o."orderCount", 0)::int AS "orderCount"
     FROM "Trip" t
     LEFT JOIN (
       SELECT "tripId", COUNT(*) AS "orderCount" FROM "Order" GROUP BY "tripId"
     ) o ON o."tripId" = t."id"
     WHERE t."userId" = $1
     ORDER BY t."createdAt" DESC
     LIMIT 5`,
    [userId]
  );

  const recentTripsSummary = [];
  for (const trip of recentTrips) {
    const items = await query<{ totalIDR: number; margin: number }>(
      `SELECT oi."totalIDR", oi."margin"
       FROM "OrderItem" oi
       JOIN "Order" o ON oi."orderId" = o."id"
       WHERE o."tripId" = $1`,
      [trip.id]
    );

    recentTripsSummary.push({
      id: trip.id,
      name: trip.name,
      country: trip.country,
      status: trip.status,
      startDate: trip.startDate,
      endDate: trip.endDate,
      orderCount: trip.orderCount,
      totalRevenue: items.reduce((sum, i) => sum + i.totalIDR, 0),
      totalMargin: items.reduce((sum, i) => sum + i.margin, 0),
    });
  }

  return NextResponse.json({
    totalTrips: totalTrips[0]?.cnt ?? 0,
    activeTrips: activeTrips[0]?.cnt ?? 0,
    totalOrders: totalOrders[0]?.cnt ?? 0,
    totalCustomers: totalCustomers[0]?.cnt ?? 0,
    totalRevenue: revenueAgg[0]?.total ?? 0,
    totalMargin: marginAgg[0]?.total ?? 0,
    recentTrips: recentTripsSummary,
  });
}
