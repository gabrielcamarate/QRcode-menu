import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { getMenuImageUrl, removeMenuImage } from "@/lib/supabase/storage";
import { toSlug } from "@/lib/utils/slug";
import PageHeader from "@/components/admin/page-header";
import CategoryDeleteModal from "@/components/admin/category-delete-modal";
import FeedbackBanner from "@/components/admin/feedback-banner";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CategoryItemPreview = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  is_available: boolean;
  image_path: string | null;
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

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug: toSlug(name),
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_active: isActive,
    })
    .select("id")
    .single();

  if (error || !data) {
    const message = error?.message || "Retorno invalido ao criar categoria.";
    redirectWith("/admin/categories", "error", `Falha ao criar categoria: ${message}`);
    return;
  }
  const categoryId = data.id;

  revalidatePath("/admin/categories");
  revalidatePath("/admin/items");
  revalidatePath("/menu");
  redirect(`/admin/categories/${categoryId}?type=success&message=Categoria%20criada%20com%20sucesso.`);
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
      if (itemId && targetCategoryId) transferMap.set(itemId, targetCategoryId);
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
        redirectWith("/admin/categories", "error", `Falha ao validar categorias de destino: ${targetCategoriesError.message}`);
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
  revalidatePath("/admin/items");
  revalidatePath("/menu");
  redirectWith("/admin/categories", "success", "Categoria removida com sucesso.");
}

async function toggleCategoryStatus(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") || "");
  const current = String(formData.get("current") || "false") === "true";

  if (!id) {
    redirectWith("/admin/categories", "error", "ID da categoria e obrigatorio.");
  }

  const { error } = await supabase.from("categories").update({ is_active: !current }).eq("id", id);

  if (error) {
    redirectWith("/admin/categories", "error", `Falha ao alterar status: ${error.message}`);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/items");
  revalidatePath("/menu");
  redirectWith("/admin/categories", "success", `Categoria ${current ? "desativada" : "ativada"} com sucesso.`);
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
      .select("id,name,description,price,is_available,category_id,image_path")
      .order("sort_order", { ascending: true }),
  ]);

  const itemsByCategory = (items || []).reduce<Record<string, CategoryItemPreview[]>>((acc, item) => {
    if (!acc[item.category_id]) acc[item.category_id] = [];

    acc[item.category_id].push({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      is_available: item.is_available,
      image_path: item.image_path,
    });

    return acc;
  }, {});

  return (
    <section>
      <PageHeader title="Categorias" description="Selecione uma categoria para gerir os itens dentro dela." />

      <FeedbackBanner type={type} message={message} />

      <form action={createCategory} className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-zinc-800">Nova categoria</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Nome</span>
            <input name="name" required placeholder="Ex.: Entradas" className="w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Ordem</span>
            <input name="sort_order" type="number" defaultValue={0} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 self-end text-sm font-medium text-zinc-700">
            <input type="checkbox" name="is_active" defaultChecked />
            Ativa
          </label>
          <button type="submit" className="self-end rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Criar categoria
          </button>
        </div>
      </form>

      {!categories || categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600">
          Nenhuma categoria cadastrada. Crie a primeira categoria para iniciar o cardapio.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(categories || []).map((category) => {
            const categoryItems = itemsByCategory[category.id] || [];
            const cover = categoryItems.find((item) => item.image_path)?.image_path || null;

            return (
              <article key={category.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="h-28 bg-zinc-100" style={cover ? { background: `url(${getMenuImageUrl(cover)}) center/cover` } : undefined} />
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-black tracking-tight text-zinc-900">{category.name}</h2>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        category.is_active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {category.is_active ? "Ativa" : "Inativa"}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-600">{categoryItems.length} item(ns)</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                      Abrir categoria
                    </Link>
                    <form action={toggleCategoryStatus}>
                      <input type="hidden" name="id" value={category.id} />
                      <input type="hidden" name="current" value={String(category.is_active)} />
                      <button
                        type="submit"
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        {category.is_active ? "Desativar" : "Ativar"}
                      </button>
                    </form>

                    <CategoryDeleteModal
                      categoryId={category.id}
                      categoryName={category.name}
                      items={categoryItems.map((item) => ({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        is_available: item.is_available,
                      }))}
                      transferOptions={(categories || [])
                        .filter((option) => option.id !== category.id)
                        .map((option) => ({ id: option.id, name: option.name }))}
                      deleteAction={deleteCategory}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
