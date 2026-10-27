"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Users, Settings, Plane } from "lucide-react";

const navItems = [
  { href: "/", label: "Beranda", icon: LayoutDashboard },
  { href: "/trips", label: "Trip", icon: Map },
  { href: "/customers", label: "Pelanggan", icon: Users },
  { href: "/settings", label: "Profil", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile: floating bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:hidden">
        <div className="glass-nav mx-auto flex max-w-lg items-center justify-around rounded-2xl px-1.5 py-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] transition-all duration-200 ${
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 1.9} />
                <span>{label}</span>
                {active && (
                  <span className="absolute -top-0.5 h-1 w-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: sticky glass header */}
      <nav className="sticky top-0 z-50 hidden border-b border-border/60 bg-white/70 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-light to-primary text-white shadow-lg shadow-primary/25">
              <Plane size={18} strokeWidth={2.2} />
            </span>
            <span className="text-[17px] font-semibold tracking-tight">
              Jastip<span className="text-primary">Tracker</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-white/60 p-1 shadow-sm">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                    active
                      ? "bg-white font-semibold text-primary shadow-sm"
                      : "text-muted hover:bg-white/70 hover:text-foreground"
                  }`}
                >
                  <Icon size={17} strokeWidth={active ? 2.4 : 1.9} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
