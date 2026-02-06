import type { ReactNode } from "react";
import Link from "next/link";
import AdminNav from "@/components/admin/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f3f4f6_0%,#e4e4e7_45%,#f4f4f5_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-6 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Painel</p>
              <h1 className="text-lg font-black tracking-tight text-zinc-900">Gestao do Cardapio</h1>
            </div>
            <Link
              href="/menu"
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Ver menu publico
            </Link>
          </div>
          <div className="mt-4">
            <AdminNav />
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
