import Image from "next/image";
import { getMenuImageUrl } from "@/lib/supabase/storage";
import { formatEurCurrency } from "@/lib/utils/currency";
import type { MenuItem } from "@/types/db";

type Props = {
  item: MenuItem;
  showUnavailableBadge: boolean;
};

export default function ItemCard({ item, showUnavailableBadge }: Props) {
  const imageSrc = item.image_path ? getMenuImageUrl(item.image_path) : null;

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:shadow-md">
      <div className="flex gap-3">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
          {imageSrc ? (
            <Image src={imageSrc} alt={item.name} fill sizes="96px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-500">
              Sem foto
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-bold text-zinc-900">{item.name}</h3>
            {item.price !== null ? (
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-900">
                {formatEurCurrency(Number(item.price))}
              </span>
            ) : null}
          </div>

          {item.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{item.description}</p>
          ) : (
            <p className="mt-1 text-sm text-zinc-400">Sem descricao</p>
          )}

          {!item.is_available && showUnavailableBadge ? (
            <span className="mt-2 inline-flex rounded-full bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700">
              Indisponivel
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
