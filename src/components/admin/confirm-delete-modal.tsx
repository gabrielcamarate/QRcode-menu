"use client";

import { useState } from "react";

type Props = {
  title: string;
  description: string;
  confirmLabel?: string;
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
};

export default function ConfirmDeleteModal({
  title,
  description,
  confirmLabel = "Confirmar exclusao",
  action,
  fields,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        Remover
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-black tracking-tight text-zinc-900">{title}</h3>
            <p className="mt-2 text-sm text-zinc-600">{description}</p>

            <form action={action} className="mt-5 flex gap-2">
              {Object.entries(fields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                {confirmLabel}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
