"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  PencilLine,
  Plane,
  MapPin,
  Globe2,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const COUNTRIES = [
  "Jepang", "Korea Selatan", "Singapura", "Malaysia", "Thailand",
  "Amerika Serikat", "Inggris", "Australia", "Jerman", "Prancis",
  "Uni Emirat Arab", "Arab Saudi", "Hong Kong", "Taiwan", "Tiongkok",
  "Filipina", "Vietnam", "Brunei", "Qatar", "Kuwait",
];

interface TripDetail {
  id: string;
  name: string;
  country: string;
  startDate: string;
  endDate: string | null;
}

function toDateInput(value: string | null) {
  if (!value) return "";
  return format(new Date(value), "yyyy-MM-dd");
}

export default function EditTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/trips/${tripId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((trip: TripDetail) => {
        setName(trip.name);
        setStartDate(toDateInput(trip.startDate));
        setEndDate(toDateInput(trip.endDate));

        if (COUNTRIES.includes(trip.country)) {
          setCountry(trip.country);
        } else {
          setCountry("Lainnya");
          setCustomCountry(trip.country);
        }
      })
      .catch(() => {
        setError("Trip tidak ditemukan");
      })
      .finally(() => setLoadingTrip(false));
  }, [tripId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const finalCountry = country === "Lainnya" ? customCountry : country;

    if (!finalCountry) {
      setError("Negara harus diisi");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          country: finalCountry,
          startDate,
          endDate: endDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Gagal menyimpan trip");
        return;
      }

      router.push(`/trips/${tripId}`);
    } catch {
      setError("Gagal menyimpan trip");
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
          aria-label="Kembali"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="eyebrow">Perjalanan</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight md:text-2xl">
            Edit Trip
          </h1>
        </div>
      </div>

      {loadingTrip ? (
        <div className="surface-card flex items-center justify-center gap-2 py-16 text-sm text-muted">
          <LoaderCircle size={18} className="animate-spin" />
          Memuat trip...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="surface-card animate-fade-up-delay-1 space-y-5 p-6"
        >
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div>
            <label className="form-label">Nama Trip *</label>
            <div className="relative">
              <Plane
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input pl-10"
                placeholder="Contoh: Trip Jepang Maret 2026"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Negara Tujuan *</label>
            <div className="relative">
              <Globe2
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="form-input pl-10 pr-9"
              >
                <option value="">Pilih negara</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Lainnya">Lainnya...</option>
              </select>
            </div>
            {country === "Lainnya" && (
              <div className="relative mt-2">
                <MapPin
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  required
                  className="form-input pl-10"
                  placeholder="Masukkan nama negara"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Tanggal Mulai *</label>
              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="form-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Tanggal Selesai</label>
              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
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
              <>
                <PencilLine size={16} /> Simpan Perubahan
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
