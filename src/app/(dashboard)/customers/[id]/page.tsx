"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowLeft,
  Trash2,
  Phone,
  Mail,
  FileText,
  Pencil,
  ShoppingBag,
  Wallet,
  ReceiptText,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { MoneyIDR } from "@/components/Money";

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPriceForeign: number;
  currency: string;
  totalIDR: number;
  margin: number;
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  trip: { id: string; name: string; country: string };
  items: OrderItem[];
}

interface CustomerData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  orders: Order[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState("");

  const fetchCustomer = useCallback(() => {
    fetch(`/api/customers/${customerId}`)
      .then((r) => r.json())
      .then((d) => {
        setCustomer(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [customerId, fetchCustomer]);

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus pelanggan ini?")) return;

    setDeleteError("");
    const res = await fetch(`/api/customers/${customerId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error || "Gagal menghapus pelanggan");
      return;
    }

    router.push("/customers");
  }

  if (loading || !customer) {
    return (
      <div className="space-y-5 pb-6">
        <div className="h-14 w-64 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/70" />
      </div>
    );
  }

  const totalSpent = customer.orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.totalIDR, 0),
    0
  );

  return (
    <div className="space-y-5 pb-6">
      <div className="animate-fade-up flex items-center gap-3">
        <Link
          href="/customers"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white/70 text-muted shadow-sm transition hover:text-foreground"
          aria-label="Kembali ke daftar pelanggan"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Detail Pelanggan</p>
          <h1 className="mt-0.5 truncate text-xl font-semibold tracking-tight md:text-2xl">
            {customer.name}
          </h1>
          <p className="text-sm text-muted">
            {customer.orders.length} order tercatat
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/customers/${customerId}/edit`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-white/70 text-muted shadow-sm transition hover:text-primary"
            aria-label="Edit pelanggan"
          >
            <Pencil size={17} />
          </Link>
          <button
            onClick={handleDelete}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-danger-ring/80 bg-white/70 text-danger shadow-sm transition hover:bg-danger-soft"
            aria-label="Hapus pelanggan"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="rounded-xl border border-danger-ring bg-danger-soft px-4 py-3 text-sm text-danger">
          {deleteError}
        </div>
      )}

      <div className="animate-fade-up-delay-1 space-y-4 md:grid md:grid-cols-3 md:gap-5 md:space-y-0">
        <div className="space-y-3 md:col-span-1">
          <div className="surface-card p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-light to-primary text-base font-semibold text-white shadow-md shadow-primary/25">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold tracking-tight">
                  {customer.name}
                </p>
                <p className="text-xs text-muted">Pelanggan</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 border-t border-border/70 pt-4">
              <div className="flex items-start gap-2.5 text-xs">
                <Phone size={13} className="mt-0.5 shrink-0 text-muted" />
                <span className={customer.phone ? "" : "text-muted"}>
                  {customer.phone || "No. telepon belum diisi"}
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <Mail size={13} className="mt-0.5 shrink-0 text-muted" />
                <span className={customer.email ? "" : "text-muted"}>
                  {customer.email || "Email belum diisi"}
                </span>
              </div>
              {customer.notes && (
                <div className="flex items-start gap-2.5 text-xs">
                  <FileText
                    size={13}
                    className="mt-0.5 shrink-0 text-muted"
                  />
                  <span className="leading-relaxed">{customer.notes}</span>
                </div>
              )}
            </div>

            <Link
              href={`/customers/${customerId}/edit`}
              className="btn-secondary mt-4 w-full py-2.5 text-xs"
            >
              <Pencil size={13} /> Edit data pelanggan
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="surface-card p-4">
              <div className="flex items-center gap-2 text-muted">
                <Wallet size={13} />
                <p className="eyebrow">Transaksi</p>
              </div>
              <p className="mt-1.5 text-base font-semibold tracking-tight">
                <MoneyIDR amount={totalSpent} />
              </p>
            </div>
            <div className="surface-card p-4">
              <div className="flex items-center gap-2 text-muted">
                <ShoppingBag size={13} />
                <p className="eyebrow">Order</p>
              </div>
              <p className="mt-1.5 text-base font-semibold tabular-nums tracking-tight">
                {customer.orders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:col-span-2">
          <div>
            <p className="eyebrow">Aktivitas</p>
            <h2 className="mt-0.5 text-lg font-semibold tracking-tight">
              Riwayat Order
            </h2>
          </div>

          {customer.orders.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <ReceiptText size={22} />
              </div>
              <p className="mt-3 text-sm font-medium">Belum ada order</p>
              <p className="mt-1 text-xs text-muted">
                Order pelanggan ini akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {customer.orders.map((order) => {
                const orderTotal = order.items.reduce((s, i) => s + i.totalIDR, 0);
                return (
                  <Link
                    key={order.id}
                    href={`/trips/${order.trip.id}`}
                    className="surface-card surface-card-hover block p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold">
                            {order.trip.name}
                          </h3>
                          <StatusBadge status={order.status} type="order" />
                        </div>
                        <p className="mt-1 text-[11px] text-muted">
                          {order.trip.country} &middot;{" "}
                          {format(new Date(order.createdAt), "dd MMM yyyy", {
                            locale: id,
                          })}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-muted">
                          {order.items
                            .map((item) => `${item.quantity}x ${item.itemName}`)
                            .join(", ")}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        <MoneyIDR amount={orderTotal} />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
