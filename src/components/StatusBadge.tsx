"use client";

const tripStatusConfig: Record<string, { label: string; color: string }> = {
  PLANNING: { label: "Perencanaan", color: "bg-blue-100 text-blue-700" },
  ONGOING: { label: "Berlangsung", color: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Selesai", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
};

const orderStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Menunggu", color: "bg-gray-100 text-gray-700" },
  ORDERED: { label: "Dipesan", color: "bg-blue-100 text-blue-700" },
  PAID: { label: "Dibayar", color: "bg-indigo-100 text-indigo-700" },
  SHIPPED: { label: "Dikirim", color: "bg-amber-100 text-amber-700" },
  DELIVERED: { label: "Sampai", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status, type }: { status: string; type: "trip" | "order" }) {
  const config =
    type === "trip"
      ? tripStatusConfig[status]
      : orderStatusConfig[status];

  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

export function StatusSelect({
  value,
  onChange,
  type,
  disabledKeys = [],
}: {
  value: string;
  onChange: (v: string) => void;
  type: "trip" | "order";
  disabledKeys?: string[];
}) {
  const config = type === "trip" ? tripStatusConfig : orderStatusConfig;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    >
      {Object.entries(config).map(([key, { label }]) => (
        <option key={key} value={key} disabled={disabledKeys.includes(key)}>
          {label}
        </option>
      ))}
    </select>
  );
}
