import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { removeMenuImage } from "@/lib/supabase/storage";
import { toSlug } from "@/lib/utils/slug";
import PageHeader from "@/components/admin/page-header";
import CategoryDeleteModal from "@/components/admin/category-delete-modal";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function redirectWith(path: string, type: "success" | "error", message: string) {
  const params = new URLSearchParams({ type, message });
  redirect(`${path}?${params.toString()}`);
}

async function createCategory(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!name) {
    redirectWith("/admin/categories", "error", "Nome da categoria e obrigatorio.");
  }

  const { error } = await supabase.from("categories").insert({
    name,
    slug: toSlug(name),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    is_active: isActive,
  });

  if (error) {
    redirectWith("/admin/categories", "error", `Falha ao criar categoria: ${error.message}`);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  redirectWith("/admin/categories", "success", "Categoria criada com sucesso.");
}

async function updateCategory(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!id || !name) {
    redirectWith("/admin/categories", "error", "ID e nome da categoria sao obrigatorios.");
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug: toSlug(name),
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    redirectWith("/admin/categories", "error", `Falha ao salvar categoria: ${error.message}`);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  redirectWith("/admin/categories", "success", "Categoria atualizada com sucesso.");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const strategy = String(formData.get("strategy") || "delete_all");
  const deleteUnmapped = String(formData.get("delete_unmapped") || "0") === "1";

  if (!id) {
    redirectWith("/admin/categories", "error", "ID da categoria e obrigatorio.");
  }

  const { data: sourceItems, error: sourceItemsError } = await supabase
    .from("items")
    .select("id,name,image_path")
    .eq("category_id", id);

  if (sourceItemsError) {
    redirectWith("/admin/categories", "error", `Falha ao buscar itens da categoria: ${sourceItemsError.message}`);
  }

  const items = sourceItems || [];

  if (items.length > 0 && strategy === "transfer_items") {
    const transferMap = new Map<string, string>();
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("transfer_to_")) continue;
      const itemId = key.replace("transfer_to_", "");
      const targetCategoryId = String(value || "");
      if (itemId && targetCategoryId) {
        transferMap.set(itemId, targetCategoryId);
      }
    }

    const validItemIds = new Set(items.map((item) => item.id));
    const requestedItemIds = [...transferMap.keys()].filter((itemId) => validItemIds.has(itemId));
    const targetCategoryIds = [...new Set([...transferMap.values()])].filter((targetId) => targetId !== id);

    if (targetCategoryIds.length > 0) {
      const { data: targetCategories, error: targetCategoriesError } = await supabase
        .from("categories")
        .select("id")
        .in("id", targetCategoryIds);

      if (targetCategoriesError) {
        redirectWith(
          "/admin/categories",
          "error",
          `Falha ao validar categorias de destino: ${targetCategoriesError.message}`,
        );
      }

      const allowedTargets = new Set((targetCategories || []).map((category) => category.id));
      for (const [itemId, targetCategoryId] of transferMap.entries()) {
        if (!validItemIds.has(itemId) || !allowedTargets.has(targetCategoryId)) {
          transferMap.delete(itemId);
        }
      }
    }

    const mappedByTarget = new Map<string, string[]>();
    for (const itemId of requestedItemIds) {
      const targetCategoryId = transferMap.get(itemId);
      if (!targetCategoryId) continue;
      const list = mappedByTarget.get(targetCategoryId) || [];
      list.push(itemId);
      mappedByTarget.set(targetCategoryId, list);
    }

    for (const [targetCategoryId, itemIds] of mappedByTarget.entries()) {
      const { error: transferError } = await supabase
        .from("items")
        .update({ category_id: targetCategoryId })
        .in("id", itemIds);

      if (transferError) {
        redirectWith("/admin/categories", "error", `Falha ao transferir itens: ${transferError.message}`);
      }
    }

    const mappedItemIds = new Set<string>([...mappedByTarget.values()].flat());
    const unmappedItems = items.filter((item) => !mappedItemIds.has(item.id));

    if (unmappedItems.length > 0 && !deleteUnmapped) {
      redirectWith(
        "/admin/categories",
        "error",
        "Existem itens sem categoria de destino. Selecione todos ou confirme a exclusao dos nao selecionados.",
      );
    }

    if (unmappedItems.length > 0) {
      const unmappedIds = unmappedItems.map((item) => item.id);
      const { error: deleteUnmappedError } = await supabase.from("items").delete().in("id", unmappedIds);
      if (deleteUnmappedError) {
        redirectWith("/admin/categories", "error", `Falha ao remover itens nao transferidos: ${deleteUnmappedError.message}`);
      }

      for (const item of unmappedItems) {
        if (!item.image_path) continue;
        try {
          await removeMenuImage(item.image_path);
        } catch {
          // best effort
        }
      }
    }
  } else if (items.length > 0) {
    const itemIds = items.map((item) => item.id);
    const { error: deleteItemsError } = await supabase.from("items").delete().in("id", itemIds);
    if (deleteItemsError) {
      redirectWith("/admin/categories", "error", `Falha ao remover itens da categoria: ${deleteItemsError.message}`);
    }

    for (const item of items) {
      if (!item.image_path) continue;
      try {
        await removeMenuImage(item.image_path);
      } catch {
        // best effort
      }
    }
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    redirectWith("/admin/categories", "error", `Falha ao remover categoria: ${error.message}`);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  redirectWith("/admin/categories", "success", "Categoria removida com sucesso.");
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const type = getFirstParam(params.type);
  const message = getFirstParam(params.message);

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("categories").select("id,name,slug,sort_order,is_active").order("sort_order", { ascending: true }),
    supabase
      .from("items")
      .select("id,name,description,price,is_available,category_id")
      .order("sort_order", { ascending: true }),
  ]);

  const itemsByCategory = (items || []).reduce<
    Record<string, { id: string; name: string; description: string | null; price: number | null; is_available: boolean }[]>
  >((acc, item) => {
    if (!acc[item.category_id]) {
      acc[item.category_id] = [];
    }
    acc[item.category_id].push({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      is_available: item.is_available,
    });
    return acc;
  }, {});

  return (
    <section>
      <PageHeader title="Categorias" />

      {message ? (
        <p
          className={`mb-4 rounded-lg p-3 text-sm ${
            type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </p>
      ) : null}

      <form action={createCategory} className="mb-6 grid gap-2 rounded-xl border bg-white p-4 sm:grid-cols-4">
        <input name="name" required placeholder="Nome da categoria" className="rounded-lg border px-3 py-2 text-sm" />
        <input
          name="sort_order"
          type="number"
          defaultValue={0}
          placeholder="Ordem"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked />
          Ativa
        </label>
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
          Criar
        </button>
      </form>

      {!categories || categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600">
          Nenhuma categoria cadastrada. Crie a primeira categoria para iniciar o cardapio.
        </p>
      ) : null}

      <div className="space-y-3">
        {(categories || []).map((category) => (
          <div key={category.id} className="grid gap-2 rounded-xl border bg-white p-4 sm:grid-cols-5">
            <form action={updateCategory} className="contents">
              <input type="hidden" name="id" value={category.id} />
              <input name="name" defaultValue={category.name} className="rounded-lg border px-3 py-2 text-sm" />
              <input
                name="sort_order"
                type="number"
                defaultValue={category.sort_order}
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked={category.is_active} />
                Ativa
              </label>
              <button type="submit" className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50">
                Salvar
              </button>
            </form>
            <CategoryDeleteModal
              categoryId={category.id}
              categoryName={category.name}
              items={itemsByCategory[category.id] || []}
              transferOptions={(categories || [])
                .filter((option) => option.id !== category.id)
                .map((option) => ({ id: option.id, name: option.name }))}
              deleteAction={deleteCategory}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
