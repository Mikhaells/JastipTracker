"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, Phone, Mail } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  _count: { orders: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) => {
        setCustomers(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold">Pelanggan</h1>
        <Link
          href="/customers/new"
          className="flex items-center gap-1 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} /> Tambah
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Users size={40} className="mx-auto text-muted mb-3" />
          <p className="text-muted">Belum ada pelanggan</p>
          <p className="text-sm text-muted mt-1">Tambah pelanggan pertama Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="block bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{c.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                    {c.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> {c.phone}
                      </span>
                    )}
                    {c.email && (
                      <span className="flex items-center gap-1 truncate">
                        <Mail size={10} /> {c.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{c._count.orders}</p>
                  <p className="text-xs text-muted">order</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
