import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getMenuImageUrl } from "@/lib/supabase/storage";
import { translateBatchToEnglish } from "@/lib/i18n/auto-translate";
import type { CategoryWithItems, Settings } from "@/types/db";

type Lang = "pt" | "en";

type PageProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const TEXT = {
  pt: {
    back: "Voltar a categorias",
    noImage: "Sem imagem",
    noItems: "Sem itens disponiveis nesta categoria.",
    unavailable: "Indisponivel",
    searchPlaceholder: "Pesquisar pratos nesta categoria",
    searchButton: "Pesquisar",
    clearButton: "Limpar",
    language: "Idioma",
    noSearchResults: "Sem resultados para a pesquisa.",
  },
  en: {
    back: "Back to categories",
    noImage: "No image",
    noItems: "No items available in this category.",
    unavailable: "Unavailable",
    searchPlaceholder: "Search dishes in this category",
    searchButton: "Search",
    clearButton: "Clear",
    language: "Language",
    noSearchResults: "No results found for your search.",
  },
} as const;

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseLang(value: string | undefined): Lang {
  return value === "en" ? "en" : "pt";
}

function buildCategoryHref(slug: string, lang: Lang, q?: string) {
  const params = new URLSearchParams();
  params.set("lang", lang);
  if (q?.trim()) params.set("q", q.trim());
  return `/menu/${slug}?${params.toString()}`;
}

function buildMenuHref(lang: Lang) {
  return `/menu?lang=${lang}`;
}

function formatEur(value: number, lang: Lang) {
  const locale = lang === "pt" ? "pt-PT" : "en-GB";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

async function localizeCategories(categories: CategoryWithItems[], lang: Lang) {
  if (lang !== "en") return categories;

  const textsToTranslate = categories.flatMap((category) => [
    category.name,
    ...category.items.flatMap((item) => [item.name, item.description || ""]),
  ]);
  const translations = await translateBatchToEnglish(textsToTranslate);

  return categories.map((category) => ({
    ...category,
    name: translations.get(category.name) || category.name,
    items: category.items.map((item) => ({
      ...item,
      name: translations.get(item.name) || item.name,
      description: item.description ? translations.get(item.description) || item.description : null,
    })),
  }));
}

async function getMenuContext(categorySlug: string): Promise<{
  categories: CategoryWithItems[];
  currentCategory?: CategoryWithItems;
  settings: Pick<Settings, "restaurant_name" | "show_unavailable_items">;
}> {
  const defaultSettings = {
    restaurant_name: "Ementa",
    show_unavailable_items: true,
  };

  if (!hasSupabaseEnv()) {
    return {
      categories: [],
      currentCategory: undefined,
      settings: defaultSettings,
    };
  }

  const supabase = await createClient();

  const [{ data: settingsData }, { data: categoriesData }] = await Promise.all([
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

  const categories = (categoriesData as CategoryWithItems[]) || [];
  const currentCategory = categories.find((category) => category.slug === categorySlug);

  return {
    categories,
    currentCategory,
    settings: settingsData || defaultSettings,
  };
}

export default async function MenuCategoryPage({ params, searchParams }: PageProps) {
  const { categorySlug } = await params;
  const search = await searchParams;
  const lang = parseLang(getFirstParam(search.lang));
  const t = TEXT[lang];
  const query = (getFirstParam(search.q) || "").trim();

  const { categories, currentCategory, settings } = await getMenuContext(categorySlug);

  if (!currentCategory) {
    notFound();
  }

  const localizedCategories = await localizeCategories(categories, lang);
  const localizedCurrentCategory = localizedCategories.find((category) => category.slug === currentCategory.slug);

  if (!localizedCurrentCategory) {
    notFound();
  }

  const visibleItems = settings.show_unavailable_items
    ? localizedCurrentCategory.items
    : localizedCurrentCategory.items.filter((item) => item.is_available);

  const normalizedQuery = query.toLocaleLowerCase();
  const filteredItems = query
    ? visibleItems.filter(
        (item) =>
          item.name.toLocaleLowerCase().includes(normalizedQuery) ||
          (item.description || "").toLocaleLowerCase().includes(normalizedQuery),
      )
    : visibleItems;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-5 sm:px-6">
      <header className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildMenuHref(lang)}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              {t.back}
            </Link>
            <p className="text-sm text-zinc-600">{settings.restaurant_name}</p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700">
            <span aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2M12 22C9.5 22 7.5 17.5 7.5 12C7.5 6.5 9.5 2 12 2M12 22C14.5 22 16.5 17.5 16.5 12C16.5 6.5 14.5 2 12 2M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2M2.5 9H21.5M2.5 15H21.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>{t.language}:</span>
            <Link
              href={buildCategoryHref(localizedCurrentCategory.slug, "pt", query)}
              className={lang === "pt" ? "text-zinc-900" : "text-zinc-500"}
            >
              PT
            </Link>
            <span>/</span>
            <Link
              href={buildCategoryHref(localizedCurrentCategory.slug, "en", query)}
              className={lang === "en" ? "text-zinc-900" : "text-zinc-500"}
            >
              EN
            </Link>
          </div>
        </div>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900">{localizedCurrentCategory.name}</h1>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {localizedCategories.map((category) => (
            <Link
              key={category.id}
              href={buildCategoryHref(category.slug, lang, query)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                category.slug === localizedCurrentCategory.slug
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <form method="get" className="mt-4 flex flex-wrap items-center gap-2">
          <input type="hidden" name="lang" value={lang} />
          <input
            name="q"
            defaultValue={query}
            placeholder={t.searchPlaceholder}
            className="min-w-56 flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm"
          />
          <button type="submit" className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            {t.searchButton}
          </button>
          {query ? (
            <Link
              href={buildCategoryHref(localizedCurrentCategory.slug, lang)}
              className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
            >
              {t.clearButton}
            </Link>
          ) : null}
        </form>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500 sm:col-span-2 lg:col-span-3">
            {query ? t.noSearchResults : t.noItems}
          </div>
        ) : (
          filteredItems.map((item) => {
            const imageUrl = item.image_path ? getMenuImageUrl(item.image_path) : null;
            return (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="relative h-40 w-full bg-zinc-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-medium text-zinc-500">{t.noImage}</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-zinc-900">{item.name}</h2>
                    {item.price !== null ? (
                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-900">
                        {formatEur(Number(item.price), lang)}
                      </span>
                    ) : null}
                  </div>

                  {item.description ? <p className="mt-2 text-sm text-zinc-600">{item.description}</p> : null}

                  {!item.is_available && settings.show_unavailable_items ? (
                    <span className="mt-3 inline-flex rounded-full bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700">
                      {t.unavailable}
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
