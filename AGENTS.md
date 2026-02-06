# AGENTS.md

## Idioma
- Responder sempre em pt-BR.

## Governanca Git (Obrigatoria)
1. Nunca trabalhar direto na `main`.
2. Toda tarefa inicia em branch no formato `tipo/slug-curto`.
3. Todo merge para `main` via Pull Request.
4. Merge padrao: `squash`.
5. Rodar `pnpm lint` e `pnpm build` antes de abrir PR.

## Politica de Commit (Obrigatoria)
1. Nao usar `git add -A` no fluxo normal.
2. Nao usar `git add .` no fluxo normal.
3. Staging deve ser por contexto, usando paths explicitos.
4. Evitar commit com muitos assuntos misturados.
5. Regra pratica:
   - 1 commit = 1 objetivo tecnico claro.
   - separar UI, backend, docs, seeds e config em commits distintos quando possivel.

## Convencao de Commit
- Subject: `tipo(escopo): resumo em ingles`
- Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`
- Body bilingue (bloco ingles e bloco pt-BR), em formato:
  - Context / Changes / Validation / Risk / Rollback
  - ---
  - Contexto / Alteracoes / Validacao / Risco / Rollback

## Fluxo Recomendado
1. `git switch -c tipo/slug-curto`
2. Implementar alteracoes
3. Staging por arquivo/contexto (sem `-A`)
4. Commit por objetivo
5. `pnpm lint` e `pnpm build`
6. `git push -u origin <branch>`
7. Abrir PR com resumo, validacao, risco e rollback
