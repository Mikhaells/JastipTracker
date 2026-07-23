"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Plus, Map } from "lucide-react";
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

  useEffect(() => {
    fetch("/api/trips")
      .then((r) => r.json())
      .then((d) => {
        setTrips(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold">Trip</h1>
        <Link
          href="/trips/new"
          className="flex items-center gap-1 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} /> Trip Baru
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Map size={40} className="mx-auto text-muted mb-3" />
          <p className="text-muted">Belum ada trip</p>
          <p className="text-sm text-muted mt-1">Buat trip pertama Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trips.map((trip) => (
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
                    {trip.country} &middot; {trip._count.orders} order
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {format(new Date(trip.startDate), "dd MMM yyyy", { locale: id })}
                    {trip.endDate &&
                      ` - ${format(new Date(trip.endDate), "dd MMM yyyy", { locale: id })}`}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
