"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type Props = {
  notAuthorized: boolean;
};

export default function LoginForm({ notAuthorized }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao autenticar";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto mt-12 max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Login Admin</h1>
      <p className="mt-1 text-sm text-zinc-600">Entre com email e senha do painel administrativo.</p>

      {notAuthorized ? (
        <p className="mt-4 rounded-lg bg-amber-100 p-3 text-sm text-amber-700">Usuario sem permissao de admin.</p>
      ) : null}

      {error ? <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</p> : null}

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-zinc-300 focus:ring"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Senha</span>
          <input
            type="password"
            name="password"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-zinc-300 focus:ring"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}
