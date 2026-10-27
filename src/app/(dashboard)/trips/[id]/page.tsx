"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  Trash2,
  MapPin,
  ChevronUp,
  ChevronDown,
  Pencil,
  Check,
  X,
  Search,
  LoaderCircle,
} from "lucide-react";
import { StatusBadge, StatusSelect } from "@/components/StatusBadge";
import { MoneyIDR, MoneyForeign } from "@/components/Money";

const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });

const COUNTRY_CENTER: Record<string, [number, number]> = {
  Jepang: [36.2048, 138.2529],
  "Korea Selatan": [35.9078, 127.7669],
  Singapura: [1.3521, 103.8198],
  Malaysia: [4.2105, 101.9758],
  Thailand: [15.87, 100.9925],
  "Amerika Serikat": [39.8283, -98.5795],
  Inggris: [54.7024, -3.2766],
  Australia: [-25.2744, 133.7751],
  Jerman: [51.1657, 10.4515],
  Prancis: [46.2276, 2.2137],
  "Uni Emirat Arab": [23.4241, 53.8478],
  "Arab Saudi": [23.8859, 45.0792],
  "Hong Kong": [22.3193, 114.1694],
  Taiwan: [23.6978, 120.9605],
  Tiongkok: [35.8617, 104.1954],
  Filipina: [12.8797, 121.774],
  Vietnam: [14.0583, 108.2772],
  Brunei: [4.5353, 114.7277],
  Qatar: [25.3548, 51.1839],
  Kuwait: [29.3117, 47.4818],
};

const COUNTRY_CODES: Record<string, string> = {
  Jepang: "jp",
  "Korea Selatan": "kr",
  Singapura: "sg",
  Malaysia: "my",
  Thailand: "th",
  "Amerika Serikat": "us",
  Inggris: "gb",
  Australia: "au",
  Jerman: "de",
  Prancis: "fr",
  "Uni Emirat Arab": "ae",
  "Arab Saudi": "sa",
  "Hong Kong": "hk",
  Taiwan: "tw",
  Tiongkok: "cn",
  Filipina: "ph",
  Vietnam: "vn",
  Brunei: "bn",
  Qatar: "qa",
  Kuwait: "kw",
};

interface PlaceResult {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  type: string | null;
}

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPriceForeign: number;
  currency: string;
  unitPriceIDR: number;
  totalIDR: number;
  margin: number;
  notes: string | null;
}

interface Order {
  id: string;
  status: string;
  notes: string | null;
  receiptUrl: string | null;
  createdAt: string;
  customer: { id: string; name: string };
  stop: { id: string; name: string } | null;
  items: OrderItem[];
}

interface TripData {
  id: string;
  name: string;
  country: string;
  status: string;
  startDate: string;
  endDate: string | null;
  orders: Order[];
  totalRevenue: number;
  totalMargin: number;
}

interface Stop {
  id: string;
  tripId: string;
  name: string;
  latitude: number;
  longitude: number;
  orderIndex: number;
  createdAt: string;
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState<Stop[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [pendingStop, setPendingStop] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [stopName, setStopName] = useState("");
  const [savingStop, setSavingStop] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [searchingPlace, setSearchingPlace] = useState(false);
  const [mapFocus, setMapFocus] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [editingStopOrderId, setEditingStopOrderId] = useState<string | null>(
    null
  );
  const [stopDraft, setStopDraft] = useState("");
  const [savingOrderStop, setSavingOrderStop] = useState(false);
  const [orderStopError, setOrderStopError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [orderStatusError, setOrderStatusError] = useState("");
  const [showStopList, setShowStopList] = useState(true);

  const fetchTrip = useCallback(() => {
    fetch(`/api/trips/${tripId}`)
      .then((r) => r.json())
      .then((d) => {
        setTrip(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tripId]);

  const fetchStops = useCallback(() => {
    fetch(`/api/trips/${tripId}/stops`)
      .then((r) => r.json())
      .then(setStops)
      .catch(() => {});
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
    fetchStops();
  }, [tripId, fetchTrip, fetchStops]);

  useEffect(() => {
    const query = placeQuery.trim();
    if (query.length < 3) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q: query });
      const countryCode = trip ? COUNTRY_CODES[trip.country] : undefined;
      if (countryCode) params.set("country", countryCode);

      fetch(`/api/geocode?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setPlaceResults(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (!cancelled) setPlaceResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearchingPlace(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [placeQuery, trip]);

  const mapStops = useMemo(
    () =>
      stops.map((s) => ({
        id: s.id,
        name: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
      })),
    [stops]
  );

  async function handleStatusChange(status: string) {
    setStatusError("");
    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatusError(data.error || "Gagal mengubah status trip");
      return;
    }

    fetchTrip();
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus trip ini? Semua order juga akan terhapus.")) return;
    await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
    router.push("/trips");
  }

  async function handleOrderStatusChange(orderId: string, status: string) {
    setOrderStatusError("");
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setOrderStatusError(data.error || "Gagal mengubah status order");
      return;
    }

    fetchTrip();
  }

  async function handleDeleteOrder(orderId: string) {
    if (!confirm("Yakin ingin menghapus order ini?")) return;
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    fetchTrip();
  }

  function startEditOrderStop(order: Order) {
    setEditingStopOrderId(order.id);
    setStopDraft(order.stop?.id ?? "");
    setOrderStopError("");
  }

  function cancelEditOrderStop() {
    setEditingStopOrderId(null);
    setStopDraft("");
    setOrderStopError("");
  }

  async function saveOrderStop(orderId: string) {
    if (savingOrderStop) return;
    setSavingOrderStop(true);
    setOrderStopError("");

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stopId: stopDraft || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        setOrderStopError(data.error || "Gagal menyimpan daerah");
        return;
      }

      setEditingStopOrderId(null);
      setStopDraft("");
      fetchTrip();
    } catch {
      setOrderStopError("Gagal menyimpan daerah");
    } finally {
      setSavingOrderStop(false);
    }
  }

  // --- Route / stops ---

  function toggleAddMode() {
    setPendingStop(null);
    setStopName("");
    setAddMode((v) => !v);
  }

  function handleMapClick(latitude: number, longitude: number) {
    if (!addMode) return;
    setPendingStop({ latitude, longitude });
  }

  function handlePlaceQueryChange(value: string) {
    setPlaceQuery(value);
    setPlaceResults([]);
    setSearchingPlace(value.trim().length >= 3);
  }

  function selectPlace(place: PlaceResult) {
    setPendingStop({ latitude: place.latitude, longitude: place.longitude });
    setStopName(place.name);
    setAddMode(true);
    setMapFocus({ latitude: place.latitude, longitude: place.longitude });
    setPlaceQuery("");
    setPlaceResults([]);
  }

  async function saveStop(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingStop || !stopName.trim() || savingStop) return;
    setSavingStop(true);
    try {
      await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: stopName.trim(),
          latitude: pendingStop.latitude,
          longitude: pendingStop.longitude,
        }),
      });
      setPendingStop(null);
      setStopName("");
      setAddMode(false);
      fetchStops();
    } finally {
      setSavingStop(false);
    }
  }

  async function moveStop(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= stops.length) return;
    const a = stops[index];
    const b = stops[target];
    setReorderingId(a.id);
    try {
      await fetch(`/api/trips/${tripId}/stops/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIndex: b.orderIndex }),
      });
      await fetch(`/api/trips/${tripId}/stops/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIndex: a.orderIndex }),
      });
      fetchStops();
    } finally {
      setReorderingId(null);
    }
  }

  function startEdit(stop: Stop) {
    setEditingId(stop.id);
    setEditName(stop.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function saveEdit(stop: Stop) {
    if (!editName.trim()) return;
    await fetch(`/api/trips/${tripId}/stops/${stop.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditingId(null);
    fetchStops();
  }

  async function handleDeleteStop(stopId: string) {
    if (!confirm("Hapus tempat ini dari rute?")) return;
    await fetch(`/api/trips/${tripId}/stops/${stopId}`, { method: "DELETE" });
    fetchStops();
  }

  if (loading || !trip) {
    return (
      <div className="space-y-5 pb-6">
        <div className="h-14 w-64 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-white/70" />
      </div>
    );
  }

  const hasPendingOrOrderedOrders = trip.orders.some(
    (o) => o.status === "PENDING" || o.status === "ORDERED"
  );
  const hasPaidOrders = trip.orders.some((o) => o.status === "PAID");

  const disabledTripStatuses = [
    ...(hasPendingOrOrderedOrders ? ["COMPLETED"] : []),
    ...(hasPaidOrders ? ["CANCELLED"] : []),
  ];

  return (
    <div className="space-y-5 pb-6">
      <div className="animate-fade-up flex items-center gap-3">
        <Link
          href="/trips"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white/70 text-muted shadow-sm transition hover:text-foreground"
          aria-label="Kembali ke daftar trip"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Detail Trip</p>
          <h1 className="mt-0.5 truncate text-xl font-semibold tracking-tight md:text-2xl">
            {trip.name}
          </h1>
          <p className="text-sm text-muted">
            {trip.country} &middot; {trip.orders.length} order
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/trips/${tripId}/edit`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-white/70 text-muted shadow-sm transition hover:text-primary"
            aria-label="Edit trip"
          >
            <Pencil size={17} />
          </Link>
          <button
            onClick={handleDelete}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200/80 bg-white/70 text-rose-500 shadow-sm transition hover:bg-rose-50"
            aria-label="Hapus trip"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <div
        id="rute"
        className="surface-card animate-fade-up-delay-1 scroll-mt-4 p-4 md:p-5"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="icon-tile h-9 w-9 bg-indigo-50 text-indigo-600">
              <MapPin size={17} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight">
                Rute Perjalanan
              </h2>
              <p className="text-xs text-muted">{stops.length} tempat</p>
            </div>
          </div>
          <button
            onClick={toggleAddMode}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              addMode
                ? "btn-secondary"
                : "btn-primary"
            }`}
          >
            {addMode ? <X size={14} /> : <Plus size={14} />}
            {addMode ? "Batal" : "Tambah Tempat"}
          </button>
        </div>

        <div className="relative mb-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white/70 px-3.5 py-2.5 shadow-sm transition focus-within:border-primary">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={placeQuery}
              onChange={(e) => handlePlaceQueryChange(e.target.value)}
              placeholder="Cari tempat, mis. Don Quijote Shinjuku"
              className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
            />
            {searchingPlace && (
              <LoaderCircle
                size={16}
                className="text-muted animate-spin shrink-0"
              />
            )}
            {placeQuery && !searchingPlace && (
              <button
                type="button"
                onClick={() => handlePlaceQueryChange("")}
                className="text-muted hover:text-foreground shrink-0"
                aria-label="Bersihkan pencarian"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {placeQuery.trim().length >= 3 &&
            !searchingPlace &&
            placeResults.length === 0 && (
              <p className="mt-2 text-sm text-muted">Tempat tidak ditemukan.</p>
            )}

          {placeResults.length > 0 && (
            <ul className="absolute left-0 right-0 z-20 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-white shadow-xl">
              {placeResults.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => selectPlace(place)}
                    className="w-full px-3.5 py-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="block text-sm font-medium truncate">
                      {place.name}
                    </span>
                    <span className="block text-xs text-muted truncate">
                      {place.displayName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {addMode && (
          <p className="mb-2.5 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-xs leading-relaxed text-indigo-700">
            Cari tempat di atas atau klik pada peta untuk menempatkan penanda
            titik yang akan dilewati.
          </p>
        )}

        <div className="relative z-0 overflow-hidden rounded-2xl border border-border shadow-sm">
          <TripMap
            stops={mapStops}
            addMode={addMode}
            pending={pendingStop}
            focus={mapFocus}
            onMapClick={handleMapClick}
            center={COUNTRY_CENTER[trip.country]}
          />
        </div>

        {pendingStop && (
          <form onSubmit={saveStop} className="mt-3 flex gap-2">
            <input
              type="text"
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              placeholder="Nama tempat, mis. Don Quijote Shinjuku"
              className="min-w-0 flex-1 rounded-xl border border-border bg-white/80 px-4 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={savingStop || !stopName.trim()}
              className="btn-primary px-4 py-2.5 text-sm disabled:opacity-50"
            >
              Simpan
            </button>
          </form>
        )}

        {stops.length > 0 && (
          <button
            type="button"
            onClick={() => setShowStopList((v) => !v)}
            aria-expanded={showStopList}
            className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-white/70 px-3.5 py-2.5 text-sm shadow-sm transition hover:border-primary/30"
          >
            <span className="font-medium">Daftar Tempat ({stops.length})</span>
            <span className="flex items-center gap-1 text-xs text-muted">
              {showStopList ? "Sembunyikan" : "Tampilkan"}
              {showStopList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
        )}

        {stops.length > 0 && showStopList ? (
          <ol className="mt-2.5 space-y-2">
            {stops.map((stop, i) => (
              <li
                key={stop.id}
                className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-white/60 p-2.5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-semibold text-white shadow-sm">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {editingId === stop.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(stop)}
                        disabled={!editName.trim()}
                        className="text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
                        aria-label="Simpan nama"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-muted hover:text-foreground"
                        aria-label="Batal"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">
                        {stop.name}
                      </span>
                      <span className="text-[11px] text-muted shrink-0">
                        {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
                {editingId !== stop.id && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => moveStop(i, -1)}
                      disabled={i === 0 || reorderingId === stop.id}
                      className="p-1 text-muted hover:text-foreground disabled:opacity-30"
                      aria-label="Naikkan urutan"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveStop(i, 1)}
                      disabled={i === stops.length - 1 || reorderingId === stop.id}
                      className="p-1 text-muted hover:text-foreground disabled:opacity-30"
                      aria-label="Turunkan urutan"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => startEdit(stop)}
                      className="p-1 text-muted hover:text-foreground"
                      aria-label="Ubah nama"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      aria-label="Hapus tempat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        ) : stops.length === 0 && !addMode ? (
          <p className="mt-3 rounded-xl border border-dashed border-border bg-white/40 px-3 py-4 text-center text-xs text-muted">
            Belum ada tempat. Klik &quot;Tambah Tempat&quot; lalu klik peta
            untuk menandai rute.
          </p>
        ) : null}
      </div>

      <div className="animate-fade-up-delay-2 space-y-4 md:grid md:grid-cols-3 md:gap-5 md:space-y-0">
        <div className="space-y-3 md:col-span-1">
          <div className="surface-card space-y-4 p-5">
            <div>
              <p className="eyebrow mb-2">Status Trip</p>
              <StatusSelect
                value={trip.status}
                onChange={handleStatusChange}
                type="trip"
                disabledKeys={disabledTripStatuses}
              />
            </div>
            {statusError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {statusError}
              </p>
            )}
            {hasPendingOrOrderedOrders && (
              <p className="text-[11px] leading-relaxed text-muted">
                Status Selesai aktif setelah tidak ada order Menunggu atau Dipesan.
              </p>
            )}
            {hasPaidOrders && (
              <p className="text-[11px] leading-relaxed text-muted">
                Status Dibatalkan tidak tersedia selama masih ada order Dibayar.
              </p>
            )}

            <div className="flex items-center justify-between border-t border-border/70 pt-3.5">
              <span className="text-xs font-medium text-muted">Tanggal</span>
              <span className="text-right text-xs font-medium">
                {format(new Date(trip.startDate), "dd MMM yyyy", { locale: id })}
                {trip.endDate &&
                  ` — ${format(new Date(trip.endDate), "dd MMM yyyy", { locale: id })}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="surface-card p-4">
              <p className="eyebrow">Revenue</p>
              <p className="mt-1.5 text-base font-semibold tracking-tight">
                <MoneyIDR amount={trip.totalRevenue} />
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="eyebrow">Margin</p>
              <p className="mt-1.5 text-base font-semibold tracking-tight text-emerald-600">
                <MoneyIDR amount={trip.totalMargin} />
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Transaksi</p>
              <h2 className="mt-0.5 text-lg font-semibold tracking-tight">
                Order ({trip.orders.length})
              </h2>
            </div>
            <Link
              href={`/trips/${tripId}/add-order`}
              className="btn-primary px-3.5 py-2 text-xs"
            >
              <Plus size={14} /> Tambah Order
            </Link>
          </div>

          {orderStatusError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
              {orderStatusError}
            </div>
          )}

          {trip.orders.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <ShoppingCart size={22} />
              </div>
              <p className="mt-3 text-sm font-medium">Belum ada order</p>
              <p className="mt-1 text-xs text-muted">
                Tambahkan order pertama untuk trip ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trip.orders.map((order) => {
                const orderTotal = order.items.reduce((s, i) => s + i.totalIDR, 0);
                const orderMargin = order.items.reduce((s, i) => s + i.margin, 0);

                return (
                  <div
                    key={order.id}
                    className="surface-card overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[15px] font-semibold tracking-tight">
                            {order.customer.name}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-muted">
                            {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", {
                              locale: id,
                            })}
                          </p>
                          <div className="mt-1.5">
                            {editingStopOrderId === order.id ? (
                              <div className="flex items-center gap-1.5">
                                <MapPin
                                  size={12}
                                  className="shrink-0 text-primary"
                                />
                                <select
                                  value={stopDraft}
                                  onChange={(e) => setStopDraft(e.target.value)}
                                  className="min-w-0 flex-1 rounded-lg border border-border bg-white px-2 py-1 text-xs focus:border-primary focus:outline-none"
                                >
                                  <option value="">Tanpa daerah</option>
                                  {stops.map((stop) => (
                                    <option key={stop.id} value={stop.id}>
                                      {stop.name}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => saveOrderStop(order.id)}
                                  disabled={savingOrderStop}
                                  className="text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
                                  aria-label="Simpan daerah"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={cancelEditOrderStop}
                                  disabled={savingOrderStop}
                                  className="text-muted hover:text-foreground disabled:opacity-40"
                                  aria-label="Batal"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs">
                                <MapPin
                                  size={12}
                                  className={
                                    order.stop
                                      ? "shrink-0 text-primary"
                                      : "shrink-0 text-slate-400"
                                  }
                                />
                                <span
                                  className={
                                    order.stop ? "text-primary" : "text-muted"
                                  }
                                >
                                  {order.stop?.name ?? "Tanpa daerah"}
                                </span>
                                <button
                                  onClick={() => startEditOrderStop(order)}
                                  className="text-muted hover:text-foreground"
                                  aria-label="Ubah daerah"
                                >
                                  <Pencil size={12} />
                                </button>
                              </div>
                            )}

                            {editingStopOrderId === order.id && (
                              <>
                                {stops.length === 0 && (
                                  <p className="mt-1 text-xs text-muted">
                                    Belum ada tempat pada rute.{" "}
                                    <Link
                                      href="#rute"
                                      className="text-primary hover:underline"
                                    >
                                      Tambah tempat
                                    </Link>
                                  </p>
                                )}
                                {orderStopError && (
                                  <p className="mt-1 text-xs text-rose-500">
                                    {orderStopError}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold">
                            <MoneyIDR amount={orderTotal} />
                          </p>
                          {orderMargin > 0 && (
                            <p className="text-[11px] font-medium text-emerald-600">
                              +<MoneyIDR amount={orderMargin} />
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        {trip.status === "PLANNING" ||
                        trip.status === "ONGOING" ? (
                          <StatusSelect
                            value={order.status}
                            onChange={(status) => handleOrderStatusChange(order.id, status)}
                            type="order"
                          />
                        ) : (
                          <StatusBadge status={order.status} type="order" />
                        )}
                      </div>

                      <div className="mt-3.5 space-y-1.5 rounded-xl bg-slate-50/70 p-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="truncate text-muted">
                              {item.quantity}x {item.itemName}
                            </span>
                            <div className="flex shrink-0 items-center gap-2">
                              <MoneyForeign
                                amount={item.unitPriceForeign * item.quantity}
                                currency={item.currency}
                              />
                              <span className="font-semibold">
                                <MoneyIDR amount={item.totalIDR} />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.receiptUrl && (
                        <a
                          href={order.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
                        >
                          Lihat Struk
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-4 border-t border-border/70 bg-white/50 px-5 py-2.5">
                      <Link
                        href={`/trips/${tripId}/orders/${order.id}/edit`}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary-dark"
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="btn-danger-ghost px-1 text-xs"
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
