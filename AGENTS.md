# AGENTS.md

## Repository Expectations
- Responder sempre em pt-BR.
- Este repositorio usa `pnpm` como gerenciador padrao.
- Foco do projeto: cardapio digital web (menu publico + painel admin), sem checkout/pagamentos.
- Skills do repositorio devem ficar em `.agents/skills`.

## Development Rules
- Manter arquitetura em App Router com organizacao:
- `src/app` (rotas)
- `src/components` (UI reutilizavel)
- `src/lib` (integracoes/helpers)
- `src/types` (tipos)
- Para Supabase:
  - Migracoes SQL em `supabase/migrations` sao fonte de verdade.
  - Em dados publicos, preservar RLS e politicas de acesso admin.

## Validation Before PR
- Rodar obrigatoriamente:
  - `pnpm lint`
  - `pnpm build`
- Nao abrir PR com falha nesses checks.

## Git Governance (Mandatory)
1. Nunca trabalhar direto na `main`.
2. Sempre criar branch no formato `tipo/slug-curto`.
3. Todo merge para `main` deve ser via Pull Request.
4. Estrategia de merge padrao: `squash`.

## Commit Policy (Mandatory)
1. Nao usar `git add -A` no fluxo normal.
2. Nao usar `git add .` no fluxo normal.
3. Staging deve ser granular com paths explicitos.
4. Evitar "commitao" com assuntos misturados.
5. Regra: 1 commit = 1 objetivo tecnico claro.

## Conventional Commits
- Subject: `tipo(escopo): resumo em ingles`
- Tipos permitidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`
- Body bilingue em blocos:
  - English: Context / Changes / Validation / Risk / Rollback
  - `---`
  - Portugues: Contexto / Alteracoes / Validacao / Risco / Rollback

## Recommended Flow
1. `git switch -c tipo/slug-curto`
2. Implementar alteracoes
3. Staging por grupo (`git add arquivo1 arquivo2`)
4. Commit por objetivo
5. `pnpm lint` e `pnpm build`
6. `git push -u origin <branch>`
7. Abrir PR para `main` com resumo, validacao, risco e rollback
