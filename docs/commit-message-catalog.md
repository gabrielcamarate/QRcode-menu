# Catalogo de Mensagens de Commit (Bilingue)

Padrao oficial:

1. Subject: `tipo(escopo): english summary`
2. Body completo em ingles
3. Separador `---`
4. Body completo em pt-BR

Tipos permitidos:
- `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`

## Templates rapidos

### `feat`
- `feat(menu): add category tabs`
- `feat(admin): add item availability toggle`
- `feat(settings): add unavailable item visibility rule`

### `fix`
- `fix(auth): fix admin login redirect`
- `fix(menu): fix price optional rendering`
- `fix(storage): fix image removal on item delete`

### `chore`
- `chore(git): enforce branch and pr workflow`
- `chore(deps): update supabase packages`
- `chore(ci): adjust lint and build checks`

### `docs`
- `docs(workflow): document git governance rules`
- `docs(setup): update supabase key setup`

### `refactor`
- `refactor(menu): simplify category data loading`
- `refactor(admin): split form actions by concern`

### `test`
- `test(menu): cover unavailable item behavior`
- `test(auth): add admin guard scenarios`

### `perf`
- `perf(images): optimize menu image rendering`
- `perf(menu): reduce category query payload`

### `ci`
- `ci(actions): add pnpm cache strategy`
- `ci(checks): require lint and build statuses`

### `build`
- `build(pnpm): migrate lockfile to pnpm`
- `build(next): update next build settings`

## Regras praticas
1. Use verbo no imperativo.
2. Mantenha assunto curto.
3. Evite ponto final.
4. Escreva primeiro o bloco completo em ingles e depois o bloco completo em pt-BR.
5. Separe os blocos com `---`.
6. Se mudar comportamento importante, detalhe no body (EN + PT-BR).
7. Evite `git add -A` e `git add .`; prefira staging por arquivo/contexto.
8. Prefira commits menores e tematicos (1 objetivo tecnico por commit).
