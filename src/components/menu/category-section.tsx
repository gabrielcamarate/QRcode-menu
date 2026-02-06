import type { CategoryWithItems } from "@/types/db";
import ItemCard from "./item-card";

type Props = {
  category: CategoryWithItems;
  showUnavailableItems: boolean;
};

export default function CategorySection({ category, showUnavailableItems }: Props) {
  const visibleItems = showUnavailableItems
    ? category.items
    : category.items.filter((item) => item.is_available);

  return (
    <section id={category.slug} className="scroll-mt-24">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black tracking-tight text-zinc-900">{category.name}</h2>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
          {visibleItems.length} item(ns)
        </span>
      </header>

      <div className="space-y-2">
        {visibleItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
            Nenhum item disponivel nesta categoria.
          </p>
        ) : (
          visibleItems.map((item) => (
            <ItemCard key={item.id} item={item} showUnavailableBadge={showUnavailableItems} />
          ))
        )}
      </div>
    </section>
  );
}
