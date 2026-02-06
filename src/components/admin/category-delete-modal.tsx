"use client";

import { useMemo, useState } from "react";
import { formatEurCurrency } from "@/lib/utils/currency";

type TransferOption = {
  id: string;
  name: string;
};

type CategoryItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  is_available: boolean;
};

type Props = {
  categoryId: string;
  categoryName: string;
  items: CategoryItem[];
  transferOptions: TransferOption[];
  deleteAction: (formData: FormData) => Promise<void>;
};

type DeleteStrategy = "delete_all" | "transfer_items";

export default function CategoryDeleteModal({
  categoryId,
  categoryName,
  items,
  transferOptions,
  deleteAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const [strategy, setStrategy] = useState<DeleteStrategy>("delete_all");
  const [bulkTarget, setBulkTarget] = useState("");
  const [itemTargets, setItemTargets] = useState<Record<string, string>>({});
  const [confirmDeleteUnselected, setConfirmDeleteUnselected] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const hasItems = items.length > 0;
  const canTransfer = transferOptions.length > 0;

  const unselectedItems = useMemo(
    () => items.filter((item) => !itemTargets[item.id]),
    [items, itemTargets],
  );

  function closeModal() {
    setOpen(false);
    setStrategy("delete_all");
    setBulkTarget("");
    setItemTargets({});
    setConfirmDeleteUnselected(false);
    setValidationMessage(null);
  }

  function applyBulkTarget() {
    if (!bulkTarget) return;
    const next: Record<string, string> = {};
    for (const item of items) {
      next[item.id] = bulkTarget;
    }
    setItemTargets(next);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (strategy !== "transfer_items") {
      setValidationMessage(null);
      return;
    }

    if (!canTransfer) {
      event.preventDefault();
      setValidationMessage("Nao existe outra categoria disponivel para transferencia.");
      return;
    }

    if (unselectedItems.length === 0) {
      setValidationMessage(null);
      return;
    }

    if (!confirmDeleteUnselected) {
      event.preventDefault();
      setValidationMessage(
        `Voce ainda nao selecionou destino para ${unselectedItems.length} item(ns). Marque a confirmacao para apagar os nao selecionados ou ajuste os destinos.`,
      );
      return;
    }

    setValidationMessage(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
      >
        Remover
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
            <div className="border-b border-red-100 bg-gradient-to-r from-red-50 to-white px-6 py-5">
              <p className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                Acao sensivel
              </p>
              <h3 className="mt-2 text-xl font-semibold text-zinc-900">Remover categoria: {categoryName}</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Esta acao afeta a organizacao do menu. Revise as opcoes antes de confirmar.
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-zinc-600">
              {hasItems
                ? `Essa categoria possui ${items.length} item(ns). Escolha como deseja continuar.`
                : "Essa categoria nao possui itens vinculados."}
              </p>

              {hasItems ? (
                <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Estrategia de remocao</p>
                  <label className="flex items-start gap-3 rounded-xl border border-transparent bg-white p-3 text-sm shadow-sm transition hover:border-red-200">
                  <input
                    type="radio"
                    name={`strategy-${categoryId}`}
                    checked={strategy === "delete_all"}
                    onChange={() => setStrategy("delete_all")}
                    className="mt-0.5 h-4 w-4 accent-red-600"
                  />
                  <span>
                    <strong className="text-zinc-900">Apagar categoria e todos os itens</strong>
                    <br />
                    <span className="text-zinc-600">
                      Todos os itens vinculados serao removidos junto com a categoria.
                    </span>
                  </span>
                </label>

                  <label className="flex items-start gap-3 rounded-xl border border-transparent bg-white p-3 text-sm shadow-sm transition hover:border-red-200">
                  <input
                    type="radio"
                    name={`strategy-${categoryId}`}
                    checked={strategy === "transfer_items"}
                    onChange={() => setStrategy("transfer_items")}
                    disabled={!canTransfer}
                    className="mt-0.5 h-4 w-4 accent-red-600"
                  />
                  <span>
                    <strong className="text-zinc-900">Transferir itens para outra categoria</strong>
                    <br />
                    <span className="text-zinc-600">
                      {canTransfer
                        ? "Selecione uma categoria para cada item ou use transferencia em massa."
                        : "Indisponivel: nao existe outra categoria para receber os itens."}
                    </span>
                  </span>
                </label>
                </div>
              ) : null}

              {hasItems && strategy === "transfer_items" ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                    <p className="text-sm font-semibold text-zinc-900">Transferencia em massa</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <select
                      value={bulkTarget}
                      onChange={(event) => setBulkTarget(event.target.value)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-zinc-500"
                    >
                      <option value="">Selecione uma categoria para todos</option>
                      {transferOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={applyBulkTarget}
                      className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                    >
                      Aplicar para todos os itens
                    </button>
                  </div>
                </div>

                  <div className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-3">
                  {items.map((item) => (
                      <div key={item.id} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
                        <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
                        {item.description ? <p className="mt-1 text-xs text-zinc-600">{item.description}</p> : null}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                          <span>{item.price == null ? "Sem preco" : formatEurCurrency(Number(item.price))}</span>
                          <span>{item.is_available ? "Disponivel" : "Indisponivel"}</span>
                        </div>
                        <select
                          value={itemTargets[item.id] || ""}
                          onChange={(event) =>
                            setItemTargets((prev) => ({ ...prev, [item.id]: event.target.value }))
                          }
                          className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-zinc-500"
                        >
                          <option value="">Sem transferencia (item sera apagado)</option>
                          {transferOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                  ))}
                </div>

                {unselectedItems.length > 0 ? (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                    <p>
                      Itens sem destino: <strong>{unselectedItems.length}</strong>
                    </p>
                    <p className="mt-1 text-xs">
                      {unselectedItems.map((item) => item.name).join(", ")}
                    </p>
                    <label className="mt-3 flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={confirmDeleteUnselected}
                        onChange={(event) => setConfirmDeleteUnselected(event.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-amber-600"
                      />
                      <span>Confirmo que os itens sem categoria de destino devem ser apagados.</span>
                    </label>
                  </div>
                ) : null}
                </div>
              ) : null}

              <form action={deleteAction} onSubmit={onSubmit} className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
              <input type="hidden" name="id" value={categoryId} />
              <input type="hidden" name="strategy" value={hasItems ? strategy : "delete_all"} />
              <input type="hidden" name="delete_unmapped" value={confirmDeleteUnselected ? "1" : "0"} />

              {Object.entries(itemTargets).map(([itemId, targetCategoryId]) => (
                <input key={itemId} type="hidden" name={`transfer_to_${itemId}`} value={targetCategoryId} />
              ))}

              {validationMessage ? (
                  <p className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {validationMessage}
                  </p>
              ) : null}

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                >
                Cancelar
              </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                {strategy === "transfer_items" ? "Transferir e remover categoria" : "Apagar categoria"}
              </button>
            </form>
          </div>
        </div>
        </div>
      ) : null}
    </>
  );
}
