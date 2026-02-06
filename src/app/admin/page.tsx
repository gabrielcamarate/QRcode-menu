import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Painel Admin</h1>
        <p className="text-sm text-zinc-600">Gerencie categorias, itens e configuracoes do cardapio.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/categories" className="rounded-xl border bg-white p-4 hover:bg-zinc-50">
          Categorias
        </Link>
        <Link href="/admin/items" className="rounded-xl border bg-white p-4 hover:bg-zinc-50">
          Itens
        </Link>
        <Link href="/admin/settings" className="rounded-xl border bg-white p-4 hover:bg-zinc-50">
          Configuracoes
        </Link>
      </div>

      <form action={signOut}>
        <button type="submit" className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-100">
          Sair
        </button>
      </form>
    </section>
  );
}
