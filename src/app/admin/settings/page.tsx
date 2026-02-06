import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export const dynamic = "force-dynamic";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

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

async function updateSettings(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();

  const restaurantName = String(formData.get("restaurant_name") || "").trim();
  const primaryColor = String(formData.get("primary_color") || "").trim() || null;
  const showUnavailable = formData.get("show_unavailable_items") === "on";

  if (!restaurantName) {
    redirectWith("/admin/settings", "error", "Nome do restaurante e obrigatorio.");
  }

  if (primaryColor && !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(primaryColor)) {
    redirectWith("/admin/settings", "error", "Cor primaria invalida. Use formato #RGB ou #RRGGBB.");
  }

  const { error } = await supabase.from("settings").upsert({
    id: SETTINGS_ID,
    restaurant_name: restaurantName,
    primary_color: primaryColor,
    show_unavailable_items: showUnavailable,
  });

  if (error) {
    redirectWith("/admin/settings", "error", `Falha ao salvar configuracoes: ${error.message}`);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/menu");
  redirectWith("/admin/settings", "success", "Configuracoes salvas com sucesso.");
}

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const type = getFirstParam(params.type);
  const message = getFirstParam(params.message);

  const { data: settings } = await supabase.from("settings").select("*").eq("id", SETTINGS_ID).maybeSingle();

  return (
    <section>
      <PageHeader title="Configuracoes" />

      {message ? (
        <p
          className={`mb-4 rounded-lg p-3 text-sm ${
            type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </p>
      ) : null}

      <form action={updateSettings} className="space-y-3 rounded-xl border bg-white p-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Nome do restaurante</span>
          <input
            name="restaurant_name"
            required
            defaultValue={settings?.restaurant_name || "Cardapio Digital"}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Cor primaria (hex, opcional)</span>
          <input
            name="primary_color"
            defaultValue={settings?.primary_color || ""}
            placeholder="#0F172A"
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="show_unavailable_items" defaultChecked={settings?.show_unavailable_items ?? true} />
          Mostrar itens indisponiveis com selo
        </label>

        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
          Salvar configuracoes
        </button>
      </form>
    </section>
  );
}
