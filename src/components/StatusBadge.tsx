"use client";

const tripStatusConfig: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  PLANNING: {
    label: "Perencanaan",
    color: "bg-primary-soft text-primary ring-primary-ring",
    dot: "bg-primary",
  },
  ONGOING: {
    label: "Berlangsung",
    color: "bg-accent-soft text-accent-dark ring-accent-ring",
    dot: "bg-accent",
  },
  COMPLETED: {
    label: "Selesai",
    color: "bg-success-soft text-success ring-success-ring",
    dot: "bg-success",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-danger-soft text-danger ring-danger-ring",
    dot: "bg-danger",
  },
};

const orderStatusConfig: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  PENDING: {
    label: "Menunggu",
    color: "bg-muted-soft text-muted ring-muted-ring",
    dot: "bg-muted",
  },
  ORDERED: {
    label: "Dipesan",
    color: "bg-primary-soft text-primary ring-primary-ring",
    dot: "bg-primary",
  },
  PAID: {
    label: "Dibayar",
    color: "bg-accent-soft text-accent-dark ring-accent-ring",
    dot: "bg-accent",
  },
  SHIPPED: {
    label: "Dikirim",
    color: "bg-warning-soft text-warning ring-warning-ring",
    dot: "bg-warning",
  },
  DELIVERED: {
    label: "Sampai",
    color: "bg-success-soft text-success ring-success-ring",
    dot: "bg-success",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-danger-soft text-danger ring-danger-ring",
    dot: "bg-danger",
  },
};

export function StatusBadge({ status, type }: { status: string; type: "trip" | "order" }) {
  const config =
    type === "trip"
      ? tripStatusConfig[status]
      : orderStatusConfig[status];

  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${config.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
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
      className="w-full cursor-pointer rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium shadow-sm transition-colors focus:border-primary focus:outline-none"
    >
      {Object.entries(config).map(([key, { label }]) => (
        <option key={key} value={key} disabled={disabledKeys.includes(key)}>
          {label}
        </option>
      ))}
    </select>
  );
}
