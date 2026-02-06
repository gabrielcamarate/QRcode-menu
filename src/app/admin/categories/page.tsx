import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { toSlug } from "@/lib/utils/slug";
import PageHeader from "@/components/admin/page-header";

export const dynamic = "force-dynamic";

async function createCategory(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!name) return;

  await supabase.from("categories").insert({
    name,
    slug: toSlug(name),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    is_active: isActive,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}

async function updateCategory(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const sortOrder = Number(formData.get("sort_order") || 0);
  const isActive = formData.get("is_active") === "on";

  if (!id || !name) return;

  await supabase
    .from("categories")
    .update({ name, slug: toSlug(name), sort_order: Number.isFinite(sortOrder) ? sortOrder : 0, is_active: isActive })
    .eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase.from("categories").delete().eq("id", id);

  revalidatePath("/admin/categories");
  revalidatePath("/menu");
}

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,sort_order,is_active")
    .order("sort_order", { ascending: true });

  return (
    <section>
      <PageHeader title="Categorias" />

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

      <div className="space-y-3">
        {(categories || []).map((category) => (
          <form key={category.id} action={updateCategory} className="grid gap-2 rounded-xl border bg-white p-4 sm:grid-cols-5">
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
            <button
              formAction={deleteCategory}
              type="submit"
              className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              Remover
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
