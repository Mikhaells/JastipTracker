"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, Trash2, Phone, Mail, FileText } from "lucide-react";
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
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const fetchCustomer = useCallback(() => {
    fetch(`/api/customers/${customerId}`)
      .then((r) => r.json())
      .then((d) => {
        setCustomer(d);
        setEditName(d.name);
        setEditPhone(d.phone || "");
        setEditEmail(d.email || "");
        setEditNotes(d.notes || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [customerId, fetchCustomer]);

  async function handleSave() {
    await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        phone: editPhone || null,
        email: editEmail || null,
        notes: editNotes || null,
      }),
    });
    setEditing(false);
    fetchCustomer();
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus pelanggan ini?")) return;
    await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
    router.push("/customers");
  }

  if (loading || !customer) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-8 w-32 bg-card rounded animate-pulse" />
        <div className="h-40 bg-card rounded-xl animate-pulse" />
      </div>
    );
  }

  const totalSpent = customer.orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.totalIDR, 0),
    0
  );

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/customers"
          className="p-2 hover:bg-card rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{customer.name}</h1>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="md:grid md:grid-cols-3 md:gap-4 space-y-4 md:space-y-0">
        <div className="md:col-span-1 bg-card rounded-xl border border-border p-4 space-y-3">
          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Nama"
              />
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Telepon"
              />
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Email"
              />
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Catatan"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-primary text-white text-sm font-medium py-2.5 rounded-lg hover:bg-primary-dark"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-card border border-border text-sm font-medium py-2.5 rounded-lg hover:bg-background"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Phone size={14} /> {customer.phone}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Mail size={14} /> {customer.email}
                    </div>
                  )}
                  {customer.notes && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <FileText size={14} /> {customer.notes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="border-t border-border pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted uppercase">Total Transaksi</p>
                    <p className="text-lg font-bold">
                      <MoneyIDR amount={totalSpent} />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase">Total Order</p>
                    <p className="text-lg font-bold">{customer.orders.length}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="font-semibold">Riwayat Order</h2>

          {customer.orders.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-muted text-sm">Belum ada order</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customer.orders.map((order) => {
                const orderTotal = order.items.reduce((s, i) => s + i.totalIDR, 0);
                return (
                  <Link
                    key={order.id}
                    href={`/trips/${order.trip.id}`}
                    className="block bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">{order.trip.name}</h3>
                          <StatusBadge status={order.status} type="order" />
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          {order.trip.country} &middot;{" "}
                          {format(new Date(order.createdAt), "dd MMM yyyy", {
                            locale: id,
                          })}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
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
