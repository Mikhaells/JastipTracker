"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { StatusBadge, StatusSelect } from "@/components/StatusBadge";
import { MoneyIDR, MoneyForeign } from "@/components/Money";

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

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrip = useCallback(() => {
    fetch(`/api/trips/${tripId}`)
      .then((r) => r.json())
      .then((d) => {
        setTrip(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
  }, [tripId, fetchTrip]);

  async function handleStatusChange(status: string) {
    await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTrip();
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus trip ini? Semua order juga akan terhapus.")) return;
    await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
    router.push("/trips");
  }

  async function handleOrderStatusChange(orderId: string, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTrip();
  }

  async function handleDeleteOrder(orderId: string) {
    if (!confirm("Yakin ingin menghapus order ini?")) return;
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    fetchTrip();
  }

  if (loading || !trip) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-8 w-32 bg-card rounded animate-pulse" />
        <div className="h-40 bg-card rounded-xl animate-pulse" />
      </div>
    );
  }

  const allOrdersDelivered =
    trip.orders.length === 0 ||
    trip.orders.every((o) => o.status === "DELIVERED");

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/trips"
          className="p-2 hover:bg-card rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{trip.name}</h1>
          <p className="text-sm text-muted">{trip.country}</p>
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
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Status</span>
            <div className="w-44">
              <StatusSelect
                value={trip.status}
                onChange={handleStatusChange}
                type="trip"
                disabledKeys={allOrdersDelivered ? [] : ["COMPLETED"]}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Tanggal</span>
            <span className="text-sm">
              {format(new Date(trip.startDate), "dd MMM yyyy", { locale: id })}
              {trip.endDate &&
                ` - ${format(new Date(trip.endDate), "dd MMM yyyy", { locale: id })}`}
            </span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted uppercase">Total Revenue</p>
                <p className="text-lg font-bold">
                  <MoneyIDR amount={trip.totalRevenue} />
                </p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase">Total Margin</p>
                <p className="text-lg font-bold text-green-600">
                  <MoneyIDR amount={trip.totalMargin} />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              Order ({trip.orders.length})
            </h2>
            <Link
              href={`/trips/${tripId}/add-order`}
              className="flex items-center gap-1 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus size={16} /> Tambah Order
            </Link>
          </div>

          {trip.orders.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <ShoppingCart size={32} className="mx-auto text-muted mb-2" />
              <p className="text-muted text-sm">Belum ada order</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trip.orders.map((order) => {
                const orderTotal = order.items.reduce((s, i) => s + i.totalIDR, 0);
                const orderMargin = order.items.reduce((s, i) => s + i.margin, 0);

                return (
                  <div
                    key={order.id}
                    className="bg-card rounded-xl border border-border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{order.customer.name}</h3>
                        </div>
                        <p className="text-xs text-muted mt-1">
                          {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", {
                            locale: id,
                          })}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm font-semibold">
                          <MoneyIDR amount={orderTotal} />
                        </p>
                        {orderMargin > 0 && (
                          <p className="text-xs text-green-600">
                            +<MoneyIDR amount={orderMargin} />
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      {trip.status === "ONGOING" ? (
                        <StatusSelect
                          value={order.status}
                          onChange={(status) => handleOrderStatusChange(order.id, status)}
                          type="order"
                        />
                      ) : (
                        <StatusBadge status={order.status} type="order" />
                      )}
                    </div>

                    <div className="mt-3 space-y-1">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted truncate mr-2">
                            {item.quantity}x {item.itemName}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <MoneyForeign
                              amount={item.unitPriceForeign * item.quantity}
                              currency={item.currency}
                            />
                            <span className="font-medium">
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
                        className="inline-block mt-2 text-xs text-primary hover:underline"
                      >
                        Lihat Struk
                      </a>
                    )}

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Hapus
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
