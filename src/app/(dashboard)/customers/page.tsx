"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Phone,
  Mail,
  Pencil,
  Trash2,
  ShoppingBag,
  UserRound,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  _count: { orders: number };
}

const avatarTones = [
  "from-primary-light to-primary",
  "from-accent to-accent-dark",
  "from-[#2c4f7c] to-[#14283f]",
  "from-[#a9843f] to-[#8a6a2f]",
  "from-[#5f6b7a] to-[#3f4954]",
  "from-[#8a6a2f] to-[#1e3a5f]",
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      const d = await res.json();
      setCustomers(Array.isArray(d) ? d : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function handleDeleteCustomer(customer: Customer) {
    if (!confirm(`Yakin ingin menghapus pelanggan "${customer.name}"?`)) {
      return;
    }

    setError("");
    setDeletingId(customer.id);

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Gagal menghapus pelanggan");
        return;
      }

      await loadCustomers();
    } catch {
      setError("Gagal menghapus pelanggan");
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
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      </div>
    );
  }

  const withOrders = customers.filter((c) => c._count.orders > 0).length;
  const totalOrders = customers.reduce((sum, c) => sum + c._count.orders, 0);

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <section className="animate-fade-up flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <UserRound size={12} /> Direktori
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight md:text-3xl">
            Pelanggan
          </h1>
          <p className="mt-1 text-sm text-muted">
            Simpan data pelanggan dan riwayat order mereka.
          </p>
        </div>

        <Link
          href="/customers/new"
          className="btn-primary self-start px-4 py-2.5 text-sm md:self-auto"
        >
          <Plus size={16} /> Tambah Pelanggan
        </Link>
      </section>

      {/* Summary strip */}
      <div className="animate-fade-up-delay-1 grid grid-cols-3 gap-2.5 md:max-w-md">
        <div className="surface-card px-4 py-3">
          <p className="eyebrow">Total</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {customers.length}
          </p>
        </div>
        <div className="surface-card px-4 py-3">
          <p className="eyebrow">Aktif</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
            {withOrders}
          </p>
        </div>
        <div className="surface-card px-4 py-3">
          <p className="eyebrow">Order</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {totalOrders}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger-ring bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {customers.length === 0 ? (
        <div className="surface-card animate-fade-up-delay-2 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Users size={26} />
          </div>
          <p className="mt-3 font-medium">Belum ada pelanggan</p>
          <p className="mt-1 text-sm text-muted">
            Tambah pelanggan pertama untuk mulai mencatat order.
          </p>
          <Link
            href="/customers/new"
            className="btn-primary mt-4 px-4 py-2.5 text-sm"
          >
            <Plus size={15} /> Tambah pelanggan
          </Link>
        </div>
      ) : (
        <div className="animate-fade-up-delay-2 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((c, index) => (
            <div
              key={c.id}
              className="surface-card surface-card-hover overflow-hidden"
            >
              <Link href={`/customers/${c.id}`} className="block p-5">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-semibold text-white shadow-md shadow-primary-dark/10 ${
                      avatarTones[index % avatarTones.length]
                    }`}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-semibold tracking-tight">
                      {c.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <ShoppingBag size={11} />
                      {c._count.orders} order
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 space-y-1.5">
                  <p className="flex items-center gap-2 truncate text-xs text-muted">
                    <Phone size={12} className="shrink-0 text-muted" />
                    {c.phone || "No. telepon belum diisi"}
                  </p>
                  <p className="flex items-center gap-2 truncate text-xs text-muted">
                    <Mail size={12} className="shrink-0 text-muted" />
                    {c.email || "Email belum diisi"}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-4 border-t border-border/70 bg-white/50 px-5 py-2.5">
                <Link
                  href={`/customers/${c.id}/edit`}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary-dark"
                >
                  <Pencil size={12} /> Edit
                </Link>
                <button
                  onClick={() => handleDeleteCustomer(c)}
                  disabled={deletingId === c.id}
                  className="btn-danger-ghost px-1 text-xs disabled:opacity-40"
                >
                  <Trash2 size={12} />
                  {deletingId === c.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
