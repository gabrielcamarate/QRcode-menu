import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function signInAndTestWrite({ url, key, email, password }) {
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data: signIn, error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError || !signIn.session) {
    return { ok: false, message: `Falha de login para ${email}: ${signInError?.message || "sem sessao"}` };
  }

  const { error: writeError } = await client
    .from("categories")
    .insert({ name: `tmp-${Date.now()}`, slug: `tmp-${Date.now()}` })
    .select();

  await client.auth.signOut();
  return { ok: !writeError, message: writeError?.message || "escrita permitida" };
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("ERRO: configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no .env.local");
    process.exit(1);
  }

  const anon = createClient(url, key, { auth: { persistSession: false } });

  const settingsRead = await anon.from("settings").select("restaurant_name").limit(1);
  const categoriesRead = await anon.from("categories").select("id,name,is_active").limit(3);
  const anonInsert = await anon.from("categories").insert({ name: "anon-test", slug: `anon-test-${Date.now()}` }).select();

  console.log("[PUBLIC_READ_SETTINGS]", settingsRead.error ? `FALHA: ${settingsRead.error.message}` : "OK");
  console.log("[PUBLIC_READ_CATEGORIES]", categoriesRead.error ? `FALHA: ${categoriesRead.error.message}` : "OK");

  if (anonInsert.error && anonInsert.error.code === "42501") {
    console.log("[ANON_WRITE_BLOCK] OK (RLS bloqueou escrita anon)");
  } else if (anonInsert.error) {
    console.log(`[ANON_WRITE_BLOCK] FALHA: ${anonInsert.error.message}`);
  } else {
    console.log("[ANON_WRITE_BLOCK] FALHA: escrita anon permitida inesperadamente");
  }

  const nonAdminEmail = process.env.NON_ADMIN_EMAIL;
  const nonAdminPassword = process.env.NON_ADMIN_PASSWORD;
  if (nonAdminEmail && nonAdminPassword) {
    const result = await signInAndTestWrite({ url, key, email: nonAdminEmail, password: nonAdminPassword });
    console.log("[NON_ADMIN_WRITE_BLOCK]", result.ok ? "FALHA: escrita permitida" : `OK (${result.message})`);
  } else {
    console.log("[NON_ADMIN_WRITE_BLOCK] SKIPPED (defina NON_ADMIN_EMAIL/NON_ADMIN_PASSWORD para testar)");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const result = await signInAndTestWrite({ url, key, email: adminEmail, password: adminPassword });
    console.log("[ADMIN_WRITE_ALLOWED]", result.ok ? "OK" : `FALHA (${result.message})`);
  } else {
    console.log("[ADMIN_WRITE_ALLOWED] SKIPPED (defina ADMIN_EMAIL/ADMIN_PASSWORD para testar)");
  }
}

main().catch((err) => {
  console.error("Falha na validacao de seguranca:", err);
  process.exit(1);
});
