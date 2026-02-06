import Link from "next/link";

type Props = {
  title: string;
};

export default function PageHeader({ title }: Props) {
  return (
    <header className="mb-6 space-y-3">
      <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin" className="rounded-lg border px-3 py-1.5 hover:bg-zinc-50">
          Dashboard
        </Link>
        <Link href="/admin/categories" className="rounded-lg border px-3 py-1.5 hover:bg-zinc-50">
          Categorias
        </Link>
        <Link href="/admin/items" className="rounded-lg border px-3 py-1.5 hover:bg-zinc-50">
          Itens
        </Link>
        <Link href="/admin/settings" className="rounded-lg border px-3 py-1.5 hover:bg-zinc-50">
          Configuracoes
        </Link>
      </nav>
    </header>
  );
}
