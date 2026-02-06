"use client";

import { useState } from "react";

type Item = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number | null;
  sortOrder: number;
  isAvailable: boolean;
};

type Props = {
  item: Item;
  updateAction: (formData: FormData) => Promise<void>;
};

export default function ItemEditModal({ item, updateAction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        Editar
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-black tracking-tight text-zinc-900">Editar item</h3>
            <p className="mt-1 text-sm text-zinc-600">{item.name}</p>

            <form action={updateAction} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="category_id" value={item.categoryId} />

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-zinc-700">Nome</span>
                <input name="name" required defaultValue={item.name} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-zinc-700">Descricao</span>
                <textarea name="description" defaultValue={item.description || ""} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-zinc-700">Preco</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={item.price ?? ""}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-zinc-700">Ordem</span>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={item.sortOrder}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <input type="checkbox" name="is_available" defaultChecked={item.isAvailable} />
                Disponivel
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
