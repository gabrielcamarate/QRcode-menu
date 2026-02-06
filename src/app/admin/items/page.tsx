import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { uploadMenuImage, removeMenuImage } from "@/lib/supabase/storage";
import { toSlug } from "@/lib/utils/slug";
import PageHeader from "@/components/admin/page-header";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function redirectWith(path: string, type: "success" | "error", message: string) {
  const params = new URLSearchParams({ type, message });
  redirect(`${path}?${params.toString()}`);
}

function validateImage(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    return "Arquivo invalido. Envie apenas imagem.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Imagem excede 5MB. Envie um arquivo menor.";
  }

  return null;
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
    redirectWith("/admin/items", "error", "Categoria e nome do item sao obrigatorios.");
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .maybeSingle();

  if (categoryError || !category) {
    redirectWith("/admin/items", "error", "Categoria selecionada nao existe.");
  }

  const imageValidationError = validateImage(file);
  if (imageValidationError) {
    redirectWith("/admin/items", "error", imageValidationError);
  }

  let imagePath: string | null = null;
  if (file && file.size > 0) {
    try {
      imagePath = await uploadMenuImage(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar imagem.";
      redirectWith("/admin/items", "error", message);
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
    redirectWith("/admin/items", "error", `Falha ao criar item: ${error.message}`);
  }

  revalidatePath("/admin/items");
  revalidatePath("/menu");
  redirectWith("/admin/items", "success", "Item criado com sucesso.");
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
    redirectWith("/admin/items", "error", "ID, categoria e nome do item sao obrigatorios.");
  }

  const { error } = await supabase
    .from("items")
    .update({
      category_id: categoryId,
      name,
      slug: toSlug(name),
      description,
      price: priceRaw ? Number(priceRaw) : null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_available: isAvailable,
    })
    .eq("id", id);

  if (error) {
    redirectWith("/admin/items", "error", `Falha ao salvar item: ${error.message}`);
  }

  revalidatePath("/admin/items");
  revalidatePath("/menu");
  redirectWith("/admin/items", "success", "Item atualizado com sucesso.");
}

async function deleteItem(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const imagePath = String(formData.get("image_path") || "");

  if (!id) {
    redirectWith("/admin/items", "error", "ID do item e obrigatorio.");
  }

  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    redirectWith("/admin/items", "error", `Falha ao remover item: ${error.message}`);
  }

  if (imagePath) {
    try {
      await removeMenuImage(imagePath);
    } catch {
      redirectWith(
        "/admin/items",
        "error",
        "Item removido, mas houve erro ao remover a imagem. Verifique o bucket menu-images.",
      );
    }
  }

  revalidatePath("/admin/items");
  revalidatePath("/menu");
  redirectWith("/admin/items", "success", "Item removido com sucesso.");
}

export default async function AdminItemsPage({ searchParams }: PageProps) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const type = getFirstParam(params.type);
  const message = getFirstParam(params.message);

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("categories").select("id,name").order("sort_order", { ascending: true }),
    supabase
      .from("items")
      .select("id,category_id,name,description,price,image_path,sort_order,is_available")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <section>
      <PageHeader title="Itens" />

      {message ? (
        <p
          className={`mb-4 rounded-lg p-3 text-sm ${
            type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </p>
      ) : null}

      {!categories || categories.length === 0 ? (
        <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Cadastre pelo menos uma categoria antes de criar itens.
        </p>
      ) : null}

      <form action={createItem} className="mb-6 space-y-2 rounded-xl border bg-white p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <select name="category_id" required className="rounded-lg border px-3 py-2 text-sm">
            <option value="">Selecione a categoria</option>
            {(categories || []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input name="name" required placeholder="Nome do item" className="rounded-lg border px-3 py-2 text-sm" />
        </div>

        <textarea name="description" placeholder="Descricao" className="w-full rounded-lg border px-3 py-2 text-sm" />

        <div className="grid gap-2 sm:grid-cols-4">
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="Preco opcional"
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input name="sort_order" type="number" defaultValue={0} className="rounded-lg border px-3 py-2 text-sm" />
          <input name="image" type="file" accept="image/*" className="rounded-lg border px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_available" defaultChecked />
            Disponivel
          </label>
        </div>

        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
          Criar item
        </button>
      </form>

      {!items || items.length === 0 ? (
        <p className="mb-4 rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600">
          Nenhum item cadastrado. Crie o primeiro item para aparecer no menu publico.
        </p>
      ) : null}

      <div className="space-y-3">
        {(items || []).map((item) => (
          <form key={item.id} action={updateItem} className="space-y-2 rounded-xl border bg-white p-4">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="image_path" value={item.image_path || ""} />

            <div className="grid gap-2 sm:grid-cols-2">
              <select name="category_id" defaultValue={item.category_id} required className="rounded-lg border px-3 py-2 text-sm">
                {(categories || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input name="name" defaultValue={item.name} required className="rounded-lg border px-3 py-2 text-sm" />
            </div>

            <textarea name="description" defaultValue={item.description || ""} className="w-full rounded-lg border px-3 py-2 text-sm" />

            <div className="grid gap-2 sm:grid-cols-4">
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={item.price ?? ""}
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <input
                name="sort_order"
                type="number"
                defaultValue={item.sort_order}
                className="rounded-lg border px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_available" defaultChecked={item.is_available} />
                Disponivel
              </label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50">
                Salvar
              </button>
              <button
                formAction={deleteItem}
                type="submit"
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Remover
              </button>
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}
