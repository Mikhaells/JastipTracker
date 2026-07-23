"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Users, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Beranda", icon: LayoutDashboard },
  { href: "/trips", label: "Trip", icon: Map },
  { href: "/customers", label: "Pelanggan", icon: Users },
  { href: "/settings", label: "Profil", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? "text-primary font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: top navbar */}
      <nav className="hidden md:block bg-card border-b border-border z-50">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-6 h-14">
          <Link href="/" className="text-lg font-bold text-primary">
            JastipTracker
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "text-primary font-semibold bg-primary/10"
                      : "text-muted hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
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
