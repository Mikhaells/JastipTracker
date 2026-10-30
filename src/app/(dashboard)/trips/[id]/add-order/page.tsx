"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  LoaderCircle,
  MapPin,
  X,
} from "lucide-react";
import CurrencyInput from "@/components/CurrencyInput";

interface Customer {
  id: string;
  name: string;
}

interface Stop {
  id: string;
  name: string;
}

interface StopResult {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

interface OrderItemInput {
  itemName: string;
  quantity: number;
  unitPriceForeign: number;
  currency: string;
  margin: number;
  notes: string;
  idrPreview: number;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function AddOrderPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState("");
  const [showAddStop, setShowAddStop] = useState(false);
  const [stopSearch, setStopSearch] = useState("");
  const [stopResults, setStopResults] = useState<StopResult[]>([]);
  const [searchingStop, setSearchingStop] = useState(false);
  const [creatingStop, setCreatingStop] = useState(false);
  const [addStopError, setAddStopError] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [items, setItems] = useState<OrderItemInput[]>([
    {
      itemName: "",
      quantity: 1,
      unitPriceForeign: 0,
      currency: "IDR",
      margin: 0,
      notes: "",
      idrPreview: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/trips/${tripId}/stops`)
      .then((r) => r.json())
      .then((d) => setStops(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [tripId]);

  useEffect(() => {
    const query = stopSearch.trim();
    if (query.length < 3) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setStopResults(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (!cancelled) setStopResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearchingStop(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [stopSearch]);

  const updateItem = useCallback(
    (index: number, field: keyof OrderItemInput, value: string | number) => {
      setItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    []
  );

  const handleCurrencyChange = useCallback(
    (index: number, value: number, idrValue: number) => {
      setItems((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          unitPriceForeign: value,
          idrPreview: idrValue,
        };
        return next;
      });
    },
    []
  );

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: generateId(),
        itemName: "",
        quantity: 1,
        unitPriceForeign: 0,
        currency: "IDR",
        margin: 0,
        notes: "",
        idrPreview: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totalIDR = items.reduce((s, i) => s + i.idrPreview * i.quantity, 0);
  const totalMargin = items.reduce((s, i) => s + i.margin, 0);

  function handleStopSearchChange(value: string) {
    setStopSearch(value);
    setStopResults([]);
    setAddStopError("");
    setSearchingStop(value.trim().length >= 3);
  }

  function cancelAddStop() {
    setShowAddStop(false);
    setStopSearch("");
    setStopResults([]);
    setSearchingStop(false);
    setAddStopError("");
  }

  async function createStopFromSearch(place: StopResult) {
    if (creatingStop) return;
    setCreatingStop(true);
    setAddStopError("");

    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: place.name,
          latitude: place.latitude,
          longitude: place.longitude,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAddStopError(data.error || "Gagal menambah wilayah");
        return;
      }

      setStops((prev) => [...prev, data]);
      setSelectedStop(data.id);
      cancelAddStop();
    } catch {
      setAddStopError("Gagal menambah wilayah");
    } finally {
      setCreatingStop(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedCustomer) {
      setError("Pilih customer terlebih dahulu");
      return;
    }

    const validItems = items.filter((i) => i.itemName && i.unitPriceForeign > 0);
    if (validItems.length === 0) {
      setError("Minimal ada 1 item dengan nama dan harga");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          customerId: selectedCustomer,
          stopId: selectedStop || null,
          notes: orderNotes || null,
          items: validItems.map((i) => ({
            itemName: i.itemName,
            quantity: i.quantity,
            unitPriceForeign: i.unitPriceForeign,
            currency: i.currency,
            margin: i.margin,
            notes: i.notes || null,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal membuat order");
        return;
      }

      router.push(`/trips/${tripId}`);
    } catch {
      setError("Gagal membuat order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-6">
      <div className="animate-fade-up flex items-center gap-3">
        <Link
          href={`/trips/${tripId}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white/70 text-muted shadow-sm transition hover:text-foreground"
          aria-label="Kembali ke trip"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="eyebrow">Order</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight md:text-2xl">
            Tambah Order
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-fade-up-delay-1 space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="surface-card space-y-4 p-5">
          <div>
            <label className="form-label">Customer *</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
              className="form-input"
            >
              <option value="">Pilih customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="mt-1.5 text-xs text-muted">
                Belum ada customer.{" "}
                <Link href="/customers/new" className="font-medium text-primary hover:underline">
                  Tambah customer
                </Link>
              </p>
            )}
          </div>

          <div>
            <label className="form-label">Daerah / Tempat</label>
            <select
              value={selectedStop}
              onChange={(e) => setSelectedStop(e.target.value)}
              className="form-input"
            >
              <option value="">Tanpa daerah</option>
              {stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name}
                </option>
              ))}
            </select>
            {!showAddStop ? (
              <p className="mt-1.5 text-xs text-muted">
                {stops.length === 0
                  ? "Belum ada tempat pada rute trip ini."
                  : "Pilih tempat dari rute yang sudah disimpan (opsional)."}{" "}
                <button
                  type="button"
                  onClick={() => setShowAddStop(true)}
                  className="font-medium text-primary hover:underline"
                >
                  Tambah wilayah baru
                </button>
              </p>
            ) : (
              <div className="mt-2.5 space-y-2 rounded-xl border border-border bg-white/60 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <MapPin size={12} className="text-primary" />
                    Tambah wilayah baru
                  </span>
                  <button
                    type="button"
                    onClick={cancelAddStop}
                    className="text-muted hover:text-foreground"
                    aria-label="Tutup"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-sm transition focus-within:border-primary">
                    <Search size={14} className="shrink-0 text-slate-400" />
                    <input
                      type="text"
                      value={stopSearch}
                      onChange={(e) => handleStopSearchChange(e.target.value)}
                      placeholder="Cari tempat, mis. Don Quijote Shinjuku"
                      className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
                    />
                    {searchingStop && (
                      <LoaderCircle
                        size={14}
                        className="shrink-0 animate-spin text-muted"
                      />
                    )}
                  </div>

                  {stopSearch.trim().length >= 3 &&
                    !searchingStop &&
                    stopResults.length === 0 && (
                      <p className="mt-2 text-xs text-muted">
                        Tempat tidak ditemukan.
                      </p>
                    )}

                  {stopResults.length > 0 && (
                    <ul className="absolute left-0 right-0 z-20 mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-border bg-white shadow-xl">
                      {stopResults.map((place) => (
                        <li key={place.id}>
                          <button
                            type="button"
                            disabled={creatingStop}
                            onClick={() => createStopFromSearch(place)}
                            className="w-full px-3.5 py-2 text-left transition-colors hover:bg-slate-50 disabled:opacity-50"
                          >
                            <span className="block truncate text-sm font-medium">
                              {place.name}
                            </span>
                            <span className="block truncate text-xs text-muted">
                              {place.displayName}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {addStopError && (
                  <p className="text-xs text-rose-500">{addStopError}</p>
                )}
                <p className="text-[11px] text-muted">
                  Wilayah yang dipilih akan disimpan ke rute trip ini.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Catatan Order</label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={2}
              className="form-input resize-none"
              placeholder="Catatan opsional..."
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Detail</p>
              <h2 className="mt-0.5 text-[15px] font-semibold tracking-tight">
                Items ({items.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary px-3 py-2 text-xs"
            >
              <Plus size={14} /> Tambah Item
            </button>
          </div>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="surface-card space-y-4 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Item {idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="btn-danger-ghost p-1"
                    aria-label="Hapus item"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div>
                <label className="form-label">Nama Item</label>
                <input
                  type="text"
                  value={item.itemName}
                  onChange={(e) => updateItem(idx, "itemName", e.target.value)}
                  className="form-input"
                  placeholder="Contoh: Tas Coach"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", parseInt(e.target.value) || 1)
                    }
                    min="1"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Margin (IDR)</label>
                  <input
                    type="number"
                    value={item.margin || ""}
                    onChange={(e) =>
                      updateItem(idx, "margin", parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    className="form-input"
                    placeholder="0"
                  />
                </div>
              </div>

              <CurrencyInput
                value={item.unitPriceForeign}
                onChange={(val, idr) => handleCurrencyChange(idx, val, idr)}
                currency={item.currency}
                onCurrencyChange={(c) => updateItem(idx, "currency", c)}
                label="Harga Satuan"
              />

              <div>
                <label className="form-label">Catatan Item</label>
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => updateItem(idx, "notes", e.target.value)}
                  className="form-input"
                  placeholder="Catatan opsional..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Subtotal</span>
            <span className="text-base font-semibold tabular-nums">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(totalIDR)}
            </span>
          </div>
          {totalMargin > 0 && (
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-sm text-muted">Margin</span>
              <span className="font-semibold tabular-nums text-emerald-600">
                +{new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalMargin)}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-sm disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle size={16} className="animate-spin" /> Menyimpan...
            </>
          ) : (
            "Simpan Order"
          )}
        </button>
      </form>
    </div>
  );
}
