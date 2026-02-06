import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import PageHeader from "@/components/admin/page-header";
import FeedbackBanner from "@/components/admin/feedback-banner";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { removeMenuImage, uploadMenuImage } from "@/lib/supabase/storage";
import { toSlug } from "@/lib/utils/slug";
import ItemCreateModal from "@/components/admin/item-create-modal";
import ItemEditModal from "@/components/admin/item-edit-modal";
import CategoryEditModal from "@/components/admin/category-edit-modal";
import ConfirmDeleteModal from "@/components/admin/confirm-delete-modal";
import { formatEurCurrency } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type PageProps = {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function redirectWith(path: string, type: "success" | "error", message: string) {
  const params = new URLSearchParams({ type, message });
  redirect(`${path}?${params.toString()}`);
}

function validateImage(file: File | null) {
  if (!file || file.size === 0) return null;

  if (!file.type.startsWith("image/")) {
    return "Arquivo invalido. Envie apenas imagem.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Imagem excede 5MB. Envie um arquivo menor.";
  }

  return null;
}

async function updateCategory(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const categoryId = String(formData.get("category_id") || "");
  const name = String(formData.get("name") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!categoryId || !name) {
    redirectWith(`/admin/categories/${categoryId}`, "error", "Nome da categoria e obrigatorio.");
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug: toSlug(name),
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_active: isActive,
    })
    .eq("id", categoryId);

  if (error) {
    redirectWith(`/admin/categories/${categoryId}`, "error", `Falha ao salvar categoria: ${error.message}`);
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/admin/items");
  revalidatePath("/menu");
  redirectWith(`/admin/categories/${categoryId}`, "success", "Categoria atualizada com sucesso.");
}

async function createItem(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const categoryId = String(formData.get("category_id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const priceRaw = String(formData.get("price") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isAvailable = formData.get("is_available") === "on";
  const file = formData.get("image") as File | null;

  if (!categoryId || !name) {
    redirectWith(`/admin/categories/${categoryId}`, "error", "Nome do item e obrigatorio.");
  }

  const imageValidationError = validateImage(file);
  if (imageValidationError) {
    redirectWith(`/admin/categories/${categoryId}`, "error", imageValidationError);
  }

  let imagePath: string | null = null;
  if (file && file.size > 0) {
    try {
      imagePath = await uploadMenuImage(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar imagem.";
      redirectWith(`/admin/categories/${categoryId}`, "error", message);
    }
  }

  const { error } = await supabase.from("items").insert({
    category_id: categoryId,
    name,
    slug: toSlug(name),
    description,
    price: priceRaw ? Number(priceRaw) : null,
    image_path: imagePath,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    is_available: isAvailable,
  });

  if (error) {
    redirectWith(`/admin/categories/${categoryId}`, "error", `Falha ao criar item: ${error.message}`);
  }

  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/admin/items");
  revalidatePath("/menu");
  redirectWith(`/admin/categories/${categoryId}`, "success", "Item criado com sucesso.");
}

async function updateItem(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") || "");
  const categoryId = String(formData.get("category_id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const priceRaw = String(formData.get("price") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isAvailable = formData.get("is_available") === "on";

  if (!id || !categoryId || !name) {
    redirectWith(`/admin/categories/${categoryId}`, "error", "Dados obrigatorios nao informados.");
  }

  const { error } = await supabase
    .from("items")
    .update({
      name,
      slug: toSlug(name),
      description,
      price: priceRaw ? Number(priceRaw) : null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_available: isAvailable,
    })
    .eq("id", id)
    .eq("category_id", categoryId);

  if (error) {
    redirectWith(`/admin/categories/${categoryId}`, "error", `Falha ao salvar item: ${error.message}`);
  }

  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/admin/items");
  revalidatePath("/menu");
  redirectWith(`/admin/categories/${categoryId}`, "success", "Item atualizado com sucesso.");
}

async function deleteItem(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") || "");
  const categoryId = String(formData.get("category_id") || "");
  const imagePath = String(formData.get("image_path") || "");

  if (!id || !categoryId) {
    redirectWith("/admin/categories", "error", "Falha ao remover item: dados invalidos.");
  }

  const { error } = await supabase.from("items").delete().eq("id", id).eq("category_id", categoryId);

  if (error) {
    redirectWith(`/admin/categories/${categoryId}`, "error", `Falha ao remover item: ${error.message}`);
  }

  if (imagePath) {
    try {
      await removeMenuImage(imagePath);
    } catch {
      redirectWith(
        `/admin/categories/${categoryId}`,
        "error",
        "Item removido, mas houve erro ao remover a imagem. Verifique o bucket menu-images.",
      );
    }
  }

  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/admin/items");
  revalidatePath("/menu");
  redirectWith(`/admin/categories/${categoryId}`, "success", "Item removido com sucesso.");
}

export default async function AdminCategoryItemsPage({ params, searchParams }: PageProps) {
  const { supabase } = await requireAdmin();
  const { categoryId } = await params;
  const query = await searchParams;
  const type = getFirstParam(query.type);
  const message = getFirstParam(query.message);

  const [{ data: category }, { data: items }] = await Promise.all([
    supabase.from("categories").select("id,name,is_active,sort_order").eq("id", categoryId).maybeSingle(),
    supabase
      .from("items")
      .select("id,name,description,price,image_path,sort_order,is_available")
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: true }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <section>
      <PageHeader title={`Categoria: ${category.name}`} description="Edite a categoria no primeiro card e os itens nos cards abaixo." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href="/admin/categories" className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
          Voltar para categorias
        </Link>
      </div>

      <FeedbackBanner type={type} message={message} />

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-zinc-800">Dados da categoria</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xl font-black tracking-tight text-zinc-900">{category.name}</p>
            <p className="text-sm text-zinc-600">Ordem #{category.sort_order}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                category.is_active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {category.is_active ? "Ativa" : "Inativa"}
            </span>
            <CategoryEditModal
              category={{ id: category.id, name: category.name, sortOrder: category.sort_order, isActive: category.is_active }}
              updateAction={updateCategory}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-zinc-800">Acoes</p>
          <ItemCreateModal categoryId={category.id} categoryName={category.name} createAction={createItem} />
        </div>

        {(items || []).map((item) => (
          <article key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-lg font-black tracking-tight text-zinc-900">{item.name}</p>
            <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{item.description || "Sem descricao"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {item.price !== null ? (
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-900">
                  {formatEurCurrency(Number(item.price))}
                </span>
              ) : null}
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">Ordem #{item.sort_order}</span>
              {!item.is_available ? (
                <span className="rounded-full bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700">Indisponivel</span>
              ) : null}
            </div>

            <div className="flex gap-2">
              <ItemEditModal
                item={{
                  id: item.id,
                  categoryId: category.id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  sortOrder: item.sort_order,
                  isAvailable: item.is_available,
                }}
                updateAction={updateItem}
              />
              <ConfirmDeleteModal
                title="Remover item"
                description={`Tem a certeza que deseja remover o item \"${item.name}\"? Esta acao nao pode ser desfeita.`}
                action={deleteItem}
                fields={{
                  id: item.id,
                  category_id: category.id,
                  image_path: item.image_path || "",
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
