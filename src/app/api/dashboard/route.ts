import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const db = await getPool();

  const [totalTrips, activeTrips, totalOrders, totalCustomers, revenueAgg, marginAgg] =
    await Promise.all([
      db.request().input("userId", userId)
        .query("SELECT COUNT(*) AS cnt FROM Trip WHERE userId = @userId"),
      db.request().input("userId", userId)
        .query("SELECT COUNT(*) AS cnt FROM Trip WHERE userId = @userId AND status = 'ONGOING'"),
      db.request().input("userId", userId)
        .query("SELECT COUNT(*) AS cnt FROM [Order] o JOIN Trip t ON o.tripId = t.id WHERE t.userId = @userId"),
      db.request().input("userId", userId)
        .query("SELECT COUNT(*) AS cnt FROM Customer WHERE userId = @userId"),
      db.request().input("userId", userId)
        .query("SELECT ISNULL(SUM(oi.totalIDR), 0) AS total FROM OrderItem oi JOIN [Order] o ON oi.orderId = o.id JOIN Trip t ON o.tripId = t.id WHERE t.userId = @userId"),
      db.request().input("userId", userId)
        .query("SELECT ISNULL(SUM(oi.margin), 0) AS total FROM OrderItem oi JOIN [Order] o ON oi.orderId = o.id JOIN Trip t ON o.tripId = t.id WHERE t.userId = @userId"),
    ]);

  const recentTripsResult = await db
    .request()
    .input("userId", userId)
    .query(`
      SELECT TOP 5 t.*, (SELECT COUNT(*) FROM [Order] o WHERE o.tripId = t.id) AS orderCount
      FROM Trip t
      WHERE t.userId = @userId
      ORDER BY t.createdAt DESC
    `);

  const recentTripsSummary = [];
  for (const trip of recentTripsResult.recordset) {
    const itemsResult = await db
      .request()
      .input("tripId", trip.id)
      .query(`
        SELECT oi.totalIDR, oi.margin
        FROM OrderItem oi
        JOIN [Order] o ON oi.orderId = o.id
        WHERE o.tripId = @tripId
      `);

    recentTripsSummary.push({
      id: trip.id,
      name: trip.name,
      country: trip.country,
      status: trip.status,
      startDate: trip.startDate,
      endDate: trip.endDate,
      orderCount: trip.orderCount,
      totalRevenue: itemsResult.recordset.reduce((sum: number, i: { totalIDR: number }) => sum + i.totalIDR, 0),
      totalMargin: itemsResult.recordset.reduce((sum: number, i: { margin: number }) => sum + i.margin, 0),
    });
  }

  return NextResponse.json({
    totalTrips: totalTrips.recordset[0].cnt,
    activeTrips: activeTrips.recordset[0].cnt,
    totalOrders: totalOrders.recordset[0].cnt,
    totalCustomers: totalCustomers.recordset[0].cnt,
    totalRevenue: revenueAgg.recordset[0].total,
    totalMargin: marginAgg.recordset[0].total,
    recentTrips: recentTripsSummary,
  });
}
