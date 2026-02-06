import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getMenuImageUrl } from "@/lib/supabase/storage";
import { translateBatchToEnglish } from "@/lib/i18n/auto-translate";
import type { CategoryWithItems, Settings } from "@/types/db";

export const dynamic = "force-dynamic";

type Lang = "pt" | "en";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const TEXT = {
  pt: {
    menu: "Ementa",
    categories: "Categorias",
    categoriesHint: "Selecione uma categoria para ver os pratos.",
    noImage: "Sem imagem",
    activeCategoriesEmpty: "Nenhuma categoria ativa cadastrada.",
    setupError:
      "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou a chave legada NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    searchPlaceholder: "Pesquisar categoria ou prato",
    searchButton: "Pesquisar",
    clearButton: "Limpar",
    language: "Idioma",
    itemsSuffix: "item(ns)",
    noSearchResults: "Sem resultados para a pesquisa.",
  },
  en: {
    menu: "Menu",
    categories: "Categories",
    categoriesHint: "Select a category to view dishes.",
    noImage: "No image",
    activeCategoriesEmpty: "No active categories available.",
    setupError:
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    searchPlaceholder: "Search category or dish",
    searchButton: "Search",
    clearButton: "Clear",
    language: "Language",
    itemsSuffix: "item(s)",
    noSearchResults: "No results found for your search.",
  },
} as const;

const DEFAULT_SETTINGS: Pick<
  Settings,
  "restaurant_name" | "show_unavailable_items" | "logo_path" | "cover_path" | "primary_color"
> = {
  restaurant_name: "Cardapio Digital",
  show_unavailable_items: true,
  logo_path: null,
  cover_path: null,
  primary_color: null,
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseLang(value: string | undefined): Lang {
  return value === "en" ? "en" : "pt";
}

function buildMenuHref(lang: Lang, q?: string) {
  const params = new URLSearchParams();
  params.set("lang", lang);
  if (q?.trim()) params.set("q", q.trim());
  return `/menu?${params.toString()}`;
}

function buildCategoryHref(slug: string, lang: Lang, q?: string) {
  const params = new URLSearchParams();
  params.set("lang", lang);
  if (q?.trim()) params.set("q", q.trim());
  return `/menu/${slug}?${params.toString()}`;
}

function formatItemCount(count: number, lang: Lang) {
  if (lang === "en") {
    return `${count} ${count === 1 ? "item" : "items"}`;
  }
  return `${count} ${count === 1 ? "item" : "itens"}`;
}

async function getMenuData(): Promise<{
  categories: CategoryWithItems[];
  settings: Pick<
    Settings,
    "restaurant_name" | "show_unavailable_items" | "logo_path" | "cover_path" | "primary_color"
  >;
  error?: string;
}> {
  if (!hasSupabaseEnv()) {
    return {
      categories: [],
      settings: DEFAULT_SETTINGS,
      error: TEXT.pt.setupError,
    };
  }

  const supabase = await createClient();

  const [{ data: settingsData }, { data: categoriesData, error }] = await Promise.all([
    supabase
      .from("settings")
      .select("restaurant_name,show_unavailable_items,logo_path,cover_path,primary_color")
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

function getCategoryImage(category: CategoryWithItems) {
  const withImage = category.items.find((item) => Boolean(item.image_path));
  return withImage?.image_path ? getMenuImageUrl(withImage.image_path) : null;
}

export default async function MenuPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const lang = parseLang(getFirstParam(params.lang));
  const t = TEXT[lang];
  const query = (getFirstParam(params.q) || "").trim();

  const { categories, settings, error } = await getMenuData();
  const coverUrl = settings.cover_path ? getMenuImageUrl(settings.cover_path) : null;
  const accentColor = settings.primary_color || "#0F172A";
  const categoriesLocalized =
    lang === "en"
      ? await (async () => {
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
        })()
      : categories;

  const normalizedQuery = query.toLocaleLowerCase();

  const filteredCategories = query
    ? categoriesLocalized.filter((category) => {
        if (category.name.toLocaleLowerCase().includes(normalizedQuery)) return true;

        return category.items.some((item) => {
          const availableBySettings = settings.show_unavailable_items || item.is_available;
          if (!availableBySettings) return false;
          return (
            item.name.toLocaleLowerCase().includes(normalizedQuery) ||
            (item.description || "").toLocaleLowerCase().includes(normalizedQuery)
          );
        });
      })
    : categoriesLocalized;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-5 sm:px-6">
      <header className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div
          className="relative h-44 p-5"
          style={{
            background: coverUrl
              ? `linear-gradient(to bottom, rgba(10,10,10,.45), rgba(10,10,10,.65)), url(${coverUrl}) center/cover`
              : `linear-gradient(135deg, ${accentColor}, #111827)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/85">{t.menu}</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white">{settings.restaurant_name}</h1>
          </div>
        </div>

        <div className="border-t border-zinc-200 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <form method="get" action="/menu" className="flex flex-1 flex-wrap items-center gap-2">
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
                <Link href={buildMenuHref(lang)} className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700">
                  {t.clearButton}
                </Link>
              ) : null}
            </form>

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
              <Link href={buildMenuHref("pt", query)} className={lang === "pt" ? "text-zinc-900" : "text-zinc-500"}>
                PT
              </Link>
              <span>/</span>
              <Link href={buildMenuHref("en", query)} className={lang === "en" ? "text-zinc-900" : "text-zinc-500"}>
                EN
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900">{t.categories}</h2>
        <p className="mt-1 text-sm text-zinc-600">{t.categoriesHint}</p>

        {error ? <p className="mt-4 rounded-lg bg-amber-100 p-3 text-sm text-amber-800">{error}</p> : null}

        {categoriesLocalized.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
            {t.activeCategoriesEmpty}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
            {t.noSearchResults}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCategories.map((category) => {
              const imageUrl = getCategoryImage(category);
              const visibleItems = settings.show_unavailable_items
                ? category.items.length
                : category.items.filter((item) => item.is_available).length;

              return (
                <Link
                  key={category.id}
                  href={buildCategoryHref(category.slug, lang, query)}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-32 w-full bg-zinc-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-medium text-zinc-500">
                        {t.noImage}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-lg font-bold text-zinc-900">{category.name}</h3>
                    <p className="mt-1 text-sm text-zinc-600">{formatItemCount(visibleItems, lang)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
