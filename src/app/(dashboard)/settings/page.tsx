"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Shield } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-4 pb-4 max-w-md md:mx-auto">
      <h1 className="text-xl font-bold pt-2">Profil</h1>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <p className="font-medium">{session?.user?.name}</p>
            <p className="text-sm text-muted">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <Shield size={18} className="text-muted" />
          <div>
            <p className="text-sm font-medium">Keamanan</p>
            <p className="text-xs text-muted">Ubah password</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} />
        <span className="font-medium">Keluar</span>
      </button>
    </div>
  );
}
