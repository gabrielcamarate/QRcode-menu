# Skills do Projeto (Resumo)

Este documento resume para que cada skill local serve e quando usar.

## `supabase-rls-guard`
- Objetivo: revisar RLS/policies e risco de exposicao em tabelas do menu.
- Quando usar: alteracoes em schema SQL, policies, auth e storage.
- Como atua: prioriza inspeção via Supabase MCP; compara com migrations.

## `menu-admin-crud`
- Objetivo: padronizar e validar fluxos CRUD do painel admin.
- Quando usar: ao criar/alterar telas de categorias, itens e settings.
- Como atua: checklist de campos obrigatorios, estados de loading/erro/sucesso e ordenacao.

## `menu-image-pipeline`
- Objetivo: padronizar upload, caminho, URL publica e remocao de imagens.
- Quando usar: qualquer mudanca em upload/render de imagens de itens/logo/capa.
- Como atua: valida naming/path, fallback visual e limpeza de arquivo no storage.

## `nextjs-app-router-structure`
- Objetivo: manter organizacao e limites de responsabilidade no Next.js.
- Quando usar: criar/ajustar rotas, layouts e componentes compartilhados.
- Como atua: reforca server-first, separacao `app/components/lib/types` e tipagem clara.

## `qr-menu-qa-playwright`
- Objetivo: validar fluxo ponta a ponta do menu publico e admin.
- Quando usar: antes de release, apos refactor grande ou correcoes sensiveis.
- Como atua: percorre fluxo minimo (`/menu` -> `/admin/login` -> CRUD -> reflexo em `/menu`) e coleta evidencias.

## Skills globais que tambem usamos
- `playwright`: automacao de browser pela CLI.
- `gh-fix-ci`: investigacao de falhas em checks do GitHub Actions.
- `vercel-deploy`: deploy preview/prod no Vercel.
- `skill-creator`: criar/atualizar skills.
- `skill-installer`: instalar skills adicionais.
