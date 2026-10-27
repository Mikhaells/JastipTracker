"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Plus,
  Map,
  TrendingUp,
  ShoppingCart,
  Users,
  ArrowRight,
  ArrowUpRight,
  Pencil,
  Trash2,
  Sparkles,
  CalendarDays,
} from "lucide-react";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const d = await res.json();
      setData(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      loadData();
    }
  }, [status, router, loadData]);

  async function handleDeleteTrip(trip: { id: string; name: string }) {
    if (
      !confirm(
        `Yakin ingin menghapus trip "${trip.name}"? Semua order dan rute di dalamnya juga akan terhapus.`
      )
    ) {
      return;
    }

    setError("");
    setDeletingId(trip.id);

    try {
      const res = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Gagal menghapus trip");
        return;
      }
      await loadData();
    } catch {
      setError("Gagal menghapus trip");
    } finally {
      setDeletingId(null);
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-primary-light to-primary shadow-lg shadow-primary/25">
            <span className="text-lg font-bold text-white">JT</span>
          </div>
          <div className="text-sm text-muted">Memuat...</div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen pb-28 md:pb-10">
        <BottomNav />
        <div className="mx-auto max-w-6xl space-y-5 px-4 pt-5 md:px-6 md:pt-8 lg:px-8">
          <div className="h-56 animate-pulse rounded-3xl bg-white/70" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "Kak";
  const marginRate =
    data.totalRevenue > 0
      ? (data.totalMargin / data.totalRevenue) * 100
      : 0;

  return (
    <div className="min-h-screen pb-28 md:pb-10">
      <BottomNav />

      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-5 md:px-6 md:pt-8 lg:px-8">
        {/* Hero */}
        <section className="hero-gradient animate-fade-up relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl shadow-primary-dark/25 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute right-1/4 top-1/3 h-24 w-24 rounded-full border border-accent/25" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                <Sparkles size={13} />
                Ringkasan Bisnis
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Halo, {firstName}
              </h1>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/70">
                Pantau perjalanan, order, dan pertumbuhan bisnis jastip Anda
                dalam satu tempat.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href="/trips/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-primary-dark shadow-lg shadow-primary-dark/20 transition hover:bg-accent-light"
                >
                  <Plus size={16} /> Trip Baru
                </Link>
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15"
                >
                  Lihat semua trip <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md md:min-w-[230px]">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/60">
                Total Revenue
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                <MoneyIDR amount={data.totalRevenue} />
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-accent-light">
                <TrendingUp size={13} />
                <MoneyIDR amount={data.totalMargin} /> margin
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-danger-ring bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="animate-fade-up-delay-1 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<Map size={19} />}
            label="Total Trip"
            value={data.totalTrips.toString()}
            sub={`${data.activeTrips} sedang berlangsung`}
            tone="navy"
          />
          <StatCard
            icon={<ShoppingCart size={19} />}
            label="Total Order"
            value={data.totalOrders.toString()}
            tone="gold"
          />
          <StatCard
            icon={<TrendingUp size={19} />}
            label="Total Revenue"
            value={<MoneyIDR amount={data.totalRevenue} />}
            tone="success"
          />
          <StatCard
            icon={<Users size={19} />}
            label="Pelanggan"
            value={data.totalCustomers.toString()}
            tone="neutral"
          />
        </div>

        {/* Margin insight */}
        {data.totalRevenue > 0 && (
          <div className="surface-card animate-fade-up-delay-2 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="icon-tile h-11 w-11 bg-success-soft text-success">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="eyebrow">Total Margin</p>
                  <p className="mt-0.5 text-xl font-semibold tracking-tight text-success">
                    <MoneyIDR amount={data.totalMargin} />
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="eyebrow">Margin Rate</p>
                <p className="mt-0.5 text-xl font-semibold tracking-tight">
                  {marginRate.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-soft">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-light to-accent-dark transition-all"
                style={{ width: `${Math.min(marginRate, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Recent trips */}
        <div className="animate-fade-up-delay-3 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Aktivitas</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                Trip Terbaru
              </h2>
            </div>
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:border-primary/30 hover:bg-white"
            >
              Lihat semua <ArrowRight size={13} />
            </Link>
          </div>

          {data.recentTrips.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Map size={26} />
              </div>
              <p className="mt-3 font-medium">Belum ada trip</p>
              <p className="mt-1 text-sm text-muted">
                Mulai catat perjalanan jastip pertama Anda.
              </p>
              <Link
                href="/trips/new"
                className="btn-primary mt-4 px-4 py-2.5 text-sm"
              >
                <Plus size={15} /> Buat trip baru
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="surface-card surface-card-hover overflow-hidden"
                >
                  <Link href={`/trips/${trip.id}`} className="block p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="icon-tile h-10 w-10 shrink-0 bg-primary-soft text-primary">
                          <Map size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-semibold">
                              {trip.name}
                            </h3>
                            <StatusBadge status={trip.status} type="trip" />
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            {trip.country} &middot; {trip.orderCount} order
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm">
                          <MoneyIDR amount={trip.totalRevenue} />
                        </p>
                        <p className="text-[11px] font-medium text-success">
                          +<MoneyIDR amount={trip.totalMargin} />
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted">
                      <CalendarDays size={12} />
                      {format(new Date(trip.startDate), "dd MMM yyyy", {
                        locale: id,
                      })}
                      {trip.endDate &&
                        ` - ${format(new Date(trip.endDate), "dd MMM yyyy", {
                          locale: id,
                        })}`}
                    </div>
                  </Link>

                  <div className="flex items-center gap-4 border-t border-border/70 bg-white/50 px-5 py-2.5">
                    <Link
                      href={`/trips/${trip.id}/edit`}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary-dark"
                    >
                      <Pencil size={12} /> Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteTrip(trip)}
                      disabled={deletingId === trip.id}
                      className="btn-danger-ghost px-1 text-xs disabled:opacity-40"
                    >
                      <Trash2 size={12} />
                      {deletingId === trip.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const statTones: Record<string, { tile: string; icon: string }> = {
  navy: { tile: "bg-primary-soft", icon: "text-primary" },
  gold: { tile: "bg-accent-soft", icon: "text-accent-dark" },
  success: { tile: "bg-success-soft", icon: "text-success" },
  neutral: { tile: "bg-muted-soft", icon: "text-muted" },
};

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone: keyof typeof statTones;
}) {
  const colors = statTones[tone];

  return (
    <div className="surface-card surface-card-hover p-4 md:p-5">
      <div className={`icon-tile h-10 w-10 ${colors.tile} ${colors.icon}`}>
        {icon}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}
