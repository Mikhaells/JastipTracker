"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BottomNav from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-primary-light to-primary shadow-lg shadow-primary/25">
            <span className="text-lg font-bold text-white">JT</span>
          </div>
          <div className="text-sm text-muted">Memuat...</div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen pb-28 md:pb-10">
      <BottomNav />
      <main className="mx-auto max-w-6xl px-4 pt-5 md:px-6 md:pt-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
