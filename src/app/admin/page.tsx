import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/admin/page-header";

export const dynamic = "force-dynamic";

async function signOut() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [{ count: categoriesCount }, { count: itemsCount }] = await Promise.all([
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("items").select("*", { count: "exact", head: true }),
  ]);

  return (
    <section>
      <PageHeader title="Dashboard" description="Resumo rapido e atalhos para gestao do cardapio." />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">Categorias</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-zinc-900">{categoriesCount || 0}</p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">Itens</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-zinc-900">{itemsCount || 0}</p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">Conta</p>
          <p className="mt-2 truncate text-sm font-semibold text-zinc-800">{user.email}</p>
        </article>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/categories"
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Gerir categorias
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Configuracoes do menu
        </Link>
      </div>

      <form action={signOut} className="mt-5">
        <button
          type="submit"
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          Sair
        </button>
      </form>
    </section>
  );
}
