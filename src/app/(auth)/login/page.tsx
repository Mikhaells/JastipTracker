"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, LogIn, Mail, LockKeyhole, Plane } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8 lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-primary text-white shadow-lg shadow-primary/25">
            <Plane size={18} strokeWidth={2.2} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">
            Jastip<span className="text-primary">Tracker</span>
          </span>
        </div>
      </div>

      <p className="eyebrow">Masuk</p>
      <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
        Selamat datang kembali
      </h1>
      <p className="mt-1 text-sm text-muted">
        Masuk untuk melanjutkan mengelola bisnis jastip Anda.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error && (
          <div className="rounded-xl border border-danger-ring bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-white/80 py-3 pl-10 pr-4 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <LockKeyhole
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-border bg-white/80 py-3 pl-10 pr-4 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none"
              placeholder="Masukkan password"
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
              <LoaderCircle size={16} className="animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <LogIn size={16} /> Masuk
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:text-primary-dark"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
