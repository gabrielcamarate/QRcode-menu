"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type Props = {
  category: Category;
  updateAction: (formData: FormData) => Promise<void>;
};

export default function CategoryEditModal({ category, updateAction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        Editar categoria
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-black tracking-tight text-zinc-900">Editar categoria</h3>

            <form action={updateAction} className="mt-4 space-y-3">
              <input type="hidden" name="category_id" value={category.id} />

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-zinc-700">Nome</span>
                <input name="name" required defaultValue={category.name} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-zinc-700">Ordem</span>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={category.sortOrder}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <input type="checkbox" name="is_active" defaultChecked={category.isActive} />
                Categoria ativa
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
                  Salvar categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
