"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import CurrencyInput from "@/components/CurrencyInput";

interface Customer {
  id: string;
  name: string;
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
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d))
      .catch(() => {});
  }, []);

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
      let receiptUrl: string | null = null;

      if (receiptFile) {
        const formData = new FormData();
        formData.append("file", receiptFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          receiptUrl = uploadData.url;
        }
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          customerId: selectedCustomer,
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

      const order = await res.json();

      if (receiptUrl) {
        await fetch(`/api/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiptUrl }),
        });
      }

      router.push(`/trips/${tripId}`);
    } catch {
      setError("Gagal membuat order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3 pt-2">
        <Link
          href={`/trips/${tripId}`}
          className="p-2 hover:bg-card rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Tambah Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Customer *
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Pilih customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {customers.length === 0 && (
            <p className="text-xs text-muted mt-1">
              Belum ada customer.{" "}
              <Link href="/customers/new" className="text-primary hover:underline">
                Tambah customer
              </Link>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Catatan Order
          </label>
          <textarea
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Catatan opsional..."
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              <Plus size={14} /> Tambah Item
            </button>
          </div>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-card rounded-xl border border-border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted">
                  Item {idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nama Item
                </label>
                <input
                  type="text"
                  value={item.itemName}
                  onChange={(e) => updateItem(idx, "itemName", e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Contoh: Tas Coach"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", parseInt(e.target.value) || 1)
                    }
                    min="1"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Margin (IDR)
                  </label>
                  <input
                    type="number"
                    value={item.margin || ""}
                    onChange={(e) =>
                      updateItem(idx, "margin", parseFloat(e.target.value) || 0)
                    }
                    min="0"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                <label className="block text-sm font-medium text-foreground mb-1">
                  Catatan Item
                </label>
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => updateItem(idx, "notes", e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Catatan opsional..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Struk / Bukti Pembayaran
          </label>
          <label className="flex items-center gap-2 justify-center border-2 border-dashed border-border rounded-lg py-4 px-3 cursor-pointer hover:border-primary/40 transition-colors">
            <Upload size={18} className="text-muted" />
            <span className="text-sm text-muted">
              {receiptFile ? receiptFile.name : "Upload foto struk"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Subtotal</span>
            <span className="font-semibold">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(totalIDR)}
            </span>
          </div>
          {totalMargin > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-muted">Margin</span>
              <span className="font-semibold text-green-600">
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
          className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan Order"}
        </button>
      </form>
    </div>
  );
}
