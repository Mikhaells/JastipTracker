import { Plane, Sparkles, TrendingUp, Users } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <aside className="hero-gradient relative hidden w-[46%] max-w-2xl flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20 backdrop-blur">
            <Plane size={21} strokeWidth={2.2} />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Jastip<span className="text-white/60">Tracker</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            <Sparkles size={13} /> Bisnis Jastip Modern
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.15] tracking-tight">
            Kelola trip, order, dan margin dalam satu tempat.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Catat perjalanan jastip, rute belanja, hingga pembayaran pelanggan
            dengan rapi dan tanpa spreadsheet.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: TrendingUp, text: "Pantau revenue dan margin real-time" },
              { icon: Users, text: "Data pelanggan dan riwayat order tersimpan" },
              { icon: Plane, text: "Rute perjalanan dengan peta interaktif" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon size={15} />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          &copy; {new Date().getFullYear()} Jastip Tracker
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
