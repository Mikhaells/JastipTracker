"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const COUNTRIES = [
  "Jepang", "Korea Selatan", "Singapura", "Malaysia", "Thailand",
  "Amerika Serikat", "Inggris", "Australia", "Jerman", "Prancis",
  "Uni Emirat Arab", "Arab Saudi", "Hong Kong", "Taiwan", "Tiongkok",
  "Filipina", "Vietnam", "Brunei", "Qatar", "Kuwait",
];

export default function NewTripPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          country: finalCountry,
          startDate,
          endDate: endDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal membuat trip");
        return;
      }

      const trip = await res.json();
      router.push(`/trips/${trip.id}`);
    } catch {
      setError("Gagal membuat trip");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/trips"
          className="p-2 hover:bg-card rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Trip Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Nama Trip *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Contoh: Trip Jepang Maret 2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Negara Tujuan *
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Pilih negara</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Lainnya">Lainnya...</option>
          </select>
          {country === "Lainnya" && (
            <input
              type="text"
              value={customCountry}
              onChange={(e) => setCustomCountry(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm mt-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Masukkan nama negara"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tanggal Mulai *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Membuat..." : "Buat Trip"}
        </button>
      </form>
    </div>
  );
}
