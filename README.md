# QRcode-menu

Cardapio digital web mobile-first para um unico restaurante, com rota publica para visitantes e painel admin com login.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Storage, RLS)

## Scripts
- `pnpm dev`
- `pnpm build`
- `pnpm lint`

## Setup
1. Copie `.env.example` para `.env.local`.
2. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY` e uma variavel legada (opcional) para compatibilidade.
4. Rode migrations SQL em `supabase/migrations` no projeto Supabase.
5. Crie ao menos um usuario no Auth e adicione o `user_id` em `admin_users`.

## Rotas
- Publico: `/menu`
- Admin: `/admin/login`, `/admin`, `/admin/categories`, `/admin/items`, `/admin/settings`

## Docs
- `docs/project-spec.md`
- `docs/supabase-setup.md`
- `docs/agent-skills-playbook.md`
- `docs/agent-skills-quick-reference.md`
- `docs/skills-overview.md`
- `docs/agents-overview.md`
- `docs/git-workflow.md`
- `docs/commit-message-catalog.md`
- `AGENTS.md`
