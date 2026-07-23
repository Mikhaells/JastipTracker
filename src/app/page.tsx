"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Plus, Map, TrendingUp, ShoppingCart, Users, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { MoneyIDR } from "@/components/Money";
import BottomNav from "@/components/BottomNav";

interface DashboardData {
  totalTrips: number;
  activeTrips: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  totalMargin: number;
  recentTrips: Array<{
    id: string;
    name: string;
    country: string;
    status: string;
    startDate: string;
    endDate: string | null;
    orderCount: number;
    totalRevenue: number;
    totalMargin: number;
  }>;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">Memuat...</div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <BottomNav />
        <div className="max-w-lg md:max-w-5xl mx-auto px-4 md:px-6 pt-4 md:pt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <BottomNav />
      <div className="max-w-lg md:max-w-5xl mx-auto px-4 md:px-6 pt-4 md:pt-6 space-y-6">
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold">
              Halo, {session?.user?.name?.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted">Ringkasan bisnis jastip Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Map size={18} />}
            label="Total Trip"
            value={data.totalTrips.toString()}
            sub={`${data.activeTrips} aktif`}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            icon={<ShoppingCart size={18} />}
            label="Total Order"
            value={data.totalOrders.toString()}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Total Revenue"
            value={<MoneyIDR amount={data.totalRevenue} />}
            color="text-green-600"
            bg="bg-green-50"
          />
          <StatCard
            icon={<Users size={18} />}
            label="Pelanggan"
            value={data.totalCustomers.toString()}
            color="text-amber-600"
            bg="bg-amber-50"
          />
        </div>

        {data.totalRevenue > 0 && (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted uppercase tracking-wide">Total Margin</p>
                <p className="text-lg font-bold text-green-600 mt-0.5">
                  <MoneyIDR amount={data.totalMargin} />
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted uppercase tracking-wide">Margin Rate</p>
                <p className="text-lg font-bold mt-0.5">
                  {data.totalRevenue > 0
                    ? `${((data.totalMargin / data.totalRevenue) * 100).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Trip Terbaru</h2>
            <Link
              href="/trips"
              className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
            >
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>

          {data.recentTrips.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Map size={32} className="mx-auto text-muted mb-2" />
              <p className="text-muted text-sm">Belum ada trip</p>
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-1 mt-3 text-sm text-primary font-medium hover:underline"
              >
                <Plus size={14} /> Buat trip baru
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {data.recentTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="block bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{trip.name}</h3>
                        <StatusBadge status={trip.status} type="trip" />
                      </div>
                      <p className="text-sm text-muted mt-1">
                        {trip.country} &middot; {trip.orderCount} order
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {format(new Date(trip.startDate), "dd MMM yyyy", { locale: id })}
                        {trip.endDate &&
                          ` - ${format(new Date(trip.endDate), "dd MMM yyyy", { locale: id })}`}
                      </p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-sm font-semibold">
                        <MoneyIDR amount={trip.totalRevenue} />
                      </p>
                      <p className="text-xs text-green-600">
                        +<MoneyIDR amount={trip.totalMargin} />
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <p className="text-xs text-muted mt-3">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}
