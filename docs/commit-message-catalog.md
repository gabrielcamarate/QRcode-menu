# Catalogo de Mensagens de Commit (Bilingue)

Padrao oficial:

`tipo(escopo): english summary / resumo em pt-BR`

Tipos permitidos:
- `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`

## Templates rapidos

### `feat`
- `feat(menu): add category tabs / adiciona abas de categoria`
- `feat(admin): add item availability toggle / adiciona alternador de disponibilidade de item`
- `feat(settings): add unavailable item visibility rule / adiciona regra de visibilidade de item indisponivel`

### `fix`
- `fix(auth): fix admin login redirect / corrige redirecionamento do login admin`
- `fix(menu): fix price optional rendering / corrige renderizacao de preco opcional`
- `fix(storage): fix image removal on item delete / corrige remocao de imagem ao excluir item`

### `chore`
- `chore(git): enforce branch and pr workflow / reforca fluxo de branch e pr`
- `chore(deps): update supabase packages / atualiza pacotes do supabase`
- `chore(ci): adjust lint and build checks / ajusta checks de lint e build`

### `docs`
- `docs(workflow): document git governance rules / documenta regras de governanca git`
- `docs(setup): update supabase key setup / atualiza configuracao de chaves do supabase`

### `refactor`
- `refactor(menu): simplify category data loading / simplifica carregamento de dados de categoria`
- `refactor(admin): split form actions by concern / separa acoes de formulario por responsabilidade`

### `test`
- `test(menu): cover unavailable item behavior / cobre comportamento de item indisponivel`
- `test(auth): add admin guard scenarios / adiciona cenarios de protecao de admin`

### `perf`
- `perf(images): optimize menu image rendering / otimiza renderizacao de imagens do menu`
- `perf(menu): reduce category query payload / reduz payload da consulta de categorias`

### `ci`
- `ci(actions): add pnpm cache strategy / adiciona estrategia de cache do pnpm`
- `ci(checks): require lint and build statuses / exige status de lint e build`

### `build`
- `build(pnpm): migrate lockfile to pnpm / migra lockfile para pnpm`
- `build(next): update next build settings / atualiza configuracoes de build do next`

## Regras praticas
1. Use verbo no imperativo.
2. Mantenha assunto curto.
3. Evite ponto final.
4. Escreva ingles primeiro e pt-BR depois.
5. Se mudar comportamento importante, detalhe no corpo do commit.
