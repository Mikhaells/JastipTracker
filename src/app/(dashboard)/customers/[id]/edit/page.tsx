"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  PencilLine,
  Phone,
  Mail,
  FileText,
  UserRound,
} from "lucide-react";
import Link from "next/link";

interface CustomerDetail {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/customers/${customerId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((customer: CustomerDetail) => {
        setName(customer.name);
        setPhone(customer.phone ?? "");
        setEmail(customer.email ?? "");
        setNotes(customer.notes ?? "");
      })
      .catch(() => {
        setError("Pelanggan tidak ditemukan");
      })
      .finally(() => setLoadingCustomer(false));
  }, [customerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || null,
          email: email || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Gagal menyimpan pelanggan");
        return;
      }

      router.push("/customers");
    } catch {
      setError("Gagal menyimpan pelanggan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-6">
      <div className="animate-fade-up flex items-center gap-3">
        <Link
          href="/customers"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white/70 text-muted shadow-sm transition hover:text-foreground"
          aria-label="Kembali"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="eyebrow">Pelanggan</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight md:text-2xl">
            Edit Pelanggan
          </h1>
        </div>
      </div>

      {loadingCustomer ? (
        <div className="surface-card flex items-center justify-center gap-2 py-16 text-sm text-muted">
          <LoaderCircle size={18} className="animate-spin" />
          Memuat pelanggan...
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
            <label className="form-label">Nama Lengkap *</label>
            <div className="relative">
              <UserRound
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input pl-10"
                placeholder="Nama pelanggan"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">No. Telepon</label>
              <div className="relative">
                <Phone
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input pl-10"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Catatan</label>
            <div className="relative">
              <FileText
                size={15}
                className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="form-input resize-none pl-10"
                placeholder="Catatan tentang pelanggan..."
              />
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
