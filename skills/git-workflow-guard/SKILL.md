# Skill: git-workflow-guard

## Quando usar
- Qualquer pedido de commit, push, branch, merge, PR ou versionamento.

## Objetivo
- Garantir fluxo Git profissional com commits granulares e rastreaveis.

## Regras duras
1. Nao comitar na `main`.
2. Nao usar `git add -A`.
3. Nao usar `git add .`.
4. Fazer staging por arquivo/grupo de contexto.
5. Quebrar alteracoes em commits menores quando houver assuntos diferentes.

## Workflow
1. Verificar branch atual.
2. Se estiver na `main`, criar branch `tipo/slug-curto`.
3. Ler `git status --short` e agrupar arquivos por objetivo tecnico.
4. Para cada grupo:
   - `git add <arquivos explicitos>`
   - commit com Conventional Commit + body bilingue.
5. Rodar `pnpm lint` e `pnpm build` ao final.
6. `git push -u origin <branch>`.
7. Abrir PR para `main` com:
   - Context/Changes/Validation/Risk/Rollback em ingles
   - ---
   - Contexto/Alteracoes/Validacao/Risco/Rollback em pt-BR

## Heuristica de agrupamento (padrao)
- Commit 1: schema/migrations/seeds
- Commit 2: backend/lib/server actions
- Commit 3: frontend UI/UX
- Commit 4: docs/workflow
- Commit 5: ajustes finais pequenos

## Anti-padroes
- Um commit unico gigante com tudo.
- Misturar docs + refactor + funcionalidade no mesmo commit sem necessidade.
- Pular lint/build antes do push.
