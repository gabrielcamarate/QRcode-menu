import CategorySection from "@/components/menu/category-section";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { CategoryWithItems, Settings } from "@/types/db";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS: Pick<Settings, "restaurant_name" | "show_unavailable_items"> = {
  restaurant_name: "Cardapio Digital",
  show_unavailable_items: true,
};

async function getMenuData(): Promise<{
  categories: CategoryWithItems[];
  settings: Pick<Settings, "restaurant_name" | "show_unavailable_items">;
  error?: string;
}> {
  if (!hasSupabaseEnv()) {
    return {
      categories: [],
      settings: DEFAULT_SETTINGS,
      error:
        "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou a chave legada NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    };
  }

  const supabase = await createClient();

  const [{ data: settingsData }, { data: categoriesData, error }] = await Promise.all([
    supabase
      .from("settings")
      .select("restaurant_name,show_unavailable_items")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle(),
    supabase
      .from("categories")
      .select(
        "id,name,slug,sort_order,is_active,created_at,updated_at,items(id,category_id,name,slug,description,price,image_path,sort_order,is_available,created_at,updated_at)",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("sort_order", { ascending: true, referencedTable: "items" }),
  ]);

  return {
    categories: (categoriesData as CategoryWithItems[]) || [],
    settings: settingsData || DEFAULT_SETTINGS,
    error: error?.message,
  };
}

export default async function MenuPage() {
  const { categories, settings, error } = await getMenuData();

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <header className="sticky top-0 z-20 -mx-4 mb-6 border-b border-zinc-200 bg-zinc-50/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">{settings.restaurant_name}</h1>
        <p className="text-sm text-zinc-600">Cardapio digital</p>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#${category.slug}`}
              className="whitespace-nowrap rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700"
            >
              {category.name}
            </a>
          ))}
        </div>
      </header>

      {error ? <p className="mb-4 rounded-lg bg-amber-100 p-3 text-sm text-amber-800">{error}</p> : null}

      <div className="space-y-8">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
            Nenhuma categoria ativa cadastrada.
          </div>
        ) : (
          categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              showUnavailableItems={settings.show_unavailable_items}
            />
          ))
        )}
      </div>
    </main>
  );
}
