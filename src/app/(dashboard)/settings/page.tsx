"use client";

import { useSession, signOut } from "next-auth/react";
import {
  LogOut,
  ShieldCheck,
  Mail,
  UserRound,
  Sparkles,
  Plane,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  const name = session?.user?.name ?? "Pengguna";
  const email = session?.user?.email ?? "-";

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-6">
      <section className="animate-fade-up">
        <p className="eyebrow flex items-center gap-2">
          <UserRound size={12} /> Akun
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight md:text-3xl">
          Profil
        </h1>
        <p className="mt-1 text-sm text-muted">
          Informasi akun dan pengaturan sesi Anda.
        </p>
      </section>

      {/* Profile card */}
      <div className="hero-gradient animate-fade-up-delay-1 relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl shadow-primary-dark/25">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-semibold ring-1 ring-white/25 backdrop-blur">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight">
              {name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-white/65">
              <Mail size={13} /> {email}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-medium text-white/80 ring-1 ring-inset ring-white/15">
              <Sparkles size={11} /> Akun Jastip Tracker
            </span>
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div className="surface-card animate-fade-up-delay-2 divide-y divide-border/70 overflow-hidden">
        <div className="flex items-center gap-3.5 p-4">
          <div className="icon-tile h-10 w-10 bg-primary-soft text-primary">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Keamanan</p>
            <p className="text-xs text-muted">
              Sesi login aktif dan terenkripsi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4">
          <div className="icon-tile h-10 w-10 bg-accent-soft text-accent-dark">
            <Plane size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Jastip Tracker</p>
            <p className="text-xs text-muted">
              Trip, order, rute, dan pelanggan dalam satu aplikasi.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="animate-fade-up-delay-3 flex w-full items-center justify-center gap-2 rounded-xl border border-danger-ring bg-white/80 py-3 text-sm font-semibold text-danger shadow-sm transition hover:border-danger/40 hover:bg-danger-soft"
      >
        <LogOut size={16} /> Keluar dari akun
      </button>
    </div>
  );
}
