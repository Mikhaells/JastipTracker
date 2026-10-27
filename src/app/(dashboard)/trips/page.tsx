"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Plus,
  Map,
  Pencil,
  Trash2,
  CalendarDays,
  ShoppingBag,
  Globe2,
  Plane,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

interface Trip {
  id: string;
  name: string;
  country: string;
  status: string;
  startDate: string;
  endDate: string | null;
  _count: { orders: number };
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadTrips = useCallback(async () => {
    try {
      const res = await fetch("/api/trips");
      const d = await res.json();
      setTrips(Array.isArray(d) ? d : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  async function handleDeleteTrip(trip: Trip) {
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
      await loadTrips();
    } catch {
      setError("Gagal menghapus trip");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 pb-4">
        <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      </div>
    );
  }

  const activeCount = trips.filter(
    (t) => t.status === "ONGOING" || t.status === "PLANNING"
  ).length;
  const totalOrders = trips.reduce((sum, t) => sum + t._count.orders, 0);

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="animate-fade-up flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Plane size={12} /> Manajemen Perjalanan
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight md:text-3xl">
            Trip
          </h1>
          <p className="mt-1 text-sm text-muted">
            Kelola perjalanan jastip, rute, dan order pelanggan.
          </p>
        </div>

        <Link
          href="/trips/new"
          className="btn-primary self-start px-4 py-2.5 text-sm md:self-auto"
        >
          <Plus size={16} /> Trip Baru
        </Link>
      </section>

      {/* Summary strip */}
      <div className="animate-fade-up-delay-1 grid grid-cols-3 gap-2.5 md:max-w-md">
        <div className="surface-card px-4 py-3">
          <p className="eyebrow">Total</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{trips.length}</p>
        </div>
        <div className="surface-card px-4 py-3">
          <p className="eyebrow">Aktif</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
            {activeCount}
          </p>
        </div>
        <div className="surface-card px-4 py-3">
          <p className="eyebrow">Order</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{totalOrders}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger-ring bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {trips.length === 0 ? (
        <div className="surface-card animate-fade-up-delay-2 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Map size={26} />
          </div>
          <p className="mt-3 font-medium">Belum ada trip</p>
          <p className="mt-1 text-sm text-muted">
            Buat trip pertama Anda dan mulai catat order.
          </p>
          <Link href="/trips/new" className="btn-primary mt-4 px-4 py-2.5 text-sm">
            <Plus size={15} /> Buat trip baru
          </Link>
        </div>
      ) : (
        <div className="animate-fade-up-delay-2 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="surface-card surface-card-hover group overflow-hidden"
            >
              <Link href={`/trips/${trip.id}`} className="block p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="icon-tile h-11 w-11 shrink-0 bg-gradient-to-br from-primary-soft to-accent-soft text-primary">
                    <Map size={19} />
                  </div>
                  <StatusBadge status={trip.status} type="trip" />
                </div>

                <h3 className="mt-3.5 truncate text-[15px] font-semibold tracking-tight">
                  {trip.name}
                </h3>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Globe2 size={12} /> {trip.country}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShoppingBag size={12} /> {trip._count.orders} order
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-soft/80 px-3 py-2 text-[11px] font-medium text-muted">
                  <CalendarDays size={12} />
                  {format(new Date(trip.startDate), "dd MMM yyyy", {
                    locale: id,
                  })}
                  {trip.endDate &&
                    ` — ${format(new Date(trip.endDate), "dd MMM yyyy", {
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
  );
}
