"use client";

import { useMemo, useState } from "react";

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
        className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
      >
        Remover
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Remover categoria: {categoryName}</h3>
            <p className="mt-1 text-sm text-zinc-600">
              {hasItems
                ? `Essa categoria possui ${items.length} item(ns). Escolha como deseja continuar.`
                : "Essa categoria nao possui itens vinculados."}
            </p>

            {hasItems ? (
              <div className="mt-4 space-y-3 rounded-lg border p-3">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name={`strategy-${categoryId}`}
                    checked={strategy === "delete_all"}
                    onChange={() => setStrategy("delete_all")}
                  />
                  <span>
                    <strong>Apagar categoria e todos os itens</strong>
                    <br />
                    Todos os itens vinculados serao removidos junto com a categoria.
                  </span>
                </label>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name={`strategy-${categoryId}`}
                    checked={strategy === "transfer_items"}
                    onChange={() => setStrategy("transfer_items")}
                    disabled={!canTransfer}
                  />
                  <span>
                    <strong>Transferir itens para outra categoria</strong>
                    <br />
                    {canTransfer
                      ? "Selecione uma categoria para cada item ou use transferencia em massa."
                      : "Indisponivel: nao existe outra categoria para receber os itens."}
                  </span>
                </label>
              </div>
            ) : null}

            {hasItems && strategy === "transfer_items" ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">Transferencia em massa</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <select
                      value={bulkTarget}
                      onChange={(event) => setBulkTarget(event.target.value)}
                      className="rounded-lg border px-3 py-2 text-sm"
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
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
                    >
                      Aplicar para todos os itens
                    </button>
                  </div>
                </div>

                <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {items.map((item) => (
                    <div key={item.id} className="rounded-lg border p-3">
                      <p className="text-sm font-semibold">{item.name}</p>
                      {item.description ? <p className="mt-1 text-xs text-zinc-600">{item.description}</p> : null}
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                        <span>{item.price == null ? "Sem preco" : `R$ ${Number(item.price).toFixed(2)}`}</span>
                        <span>{item.is_available ? "Disponivel" : "Indisponivel"}</span>
                      </div>
                      <select
                        value={itemTargets[item.id] || ""}
                        onChange={(event) =>
                          setItemTargets((prev) => ({ ...prev, [item.id]: event.target.value }))
                        }
                        className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
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
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
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
                      />
                      <span>Confirmo que os itens sem categoria de destino devem ser apagados.</span>
                    </label>
                  </div>
                ) : null}
              </div>
            ) : null}

            <form action={deleteAction} onSubmit={onSubmit} className="mt-5 flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={categoryId} />
              <input type="hidden" name="strategy" value={hasItems ? strategy : "delete_all"} />
              <input type="hidden" name="delete_unmapped" value={confirmDeleteUnselected ? "1" : "0"} />

              {Object.entries(itemTargets).map(([itemId, targetCategoryId]) => (
                <input key={itemId} type="hidden" name={`transfer_to_${itemId}`} value={targetCategoryId} />
              ))}

              {validationMessage ? (
                <p className="w-full rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">{validationMessage}</p>
              ) : null}

              <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50">
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                {strategy === "transfer_items" ? "Transferir e remover categoria" : "Apagar categoria"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
