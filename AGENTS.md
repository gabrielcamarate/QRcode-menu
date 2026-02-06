# AGENTS.md

## Idioma de Resposta
- O agente deve sempre responder em portugues do Brasil (pt-BR), inclusive em explicacoes tecnicas e status de execucao.

## Missao do Projeto
- Construir e manter um cardapio digital mobile-first via QR Code para um unico restaurante, com menu publico e painel admin autenticado.

## Escopo
### Dentro do Escopo (MVP)
- Menu publico em `/menu` com secoes de categorias e itens.
- Autenticacao admin e gestao em `/admin/*` para categorias, itens e configuracoes.
- Supabase (Postgres, Auth, Storage e RLS).

### Fora do Escopo (MVP)
- Carrinho, checkout, pagamento e fluxo de pedidos.
- Multi-tenant para varios restaurantes.
- Permissoes por papeis de admin.

## Stack e Padroes
- Next.js App Router + TypeScript + Tailwind CSS.
- Supabase para dados, auth e storage.
- Gerenciador de pacotes padrao: `pnpm` (evitar `npm`/`yarn` neste repo).
- Migracoes SQL em `supabase/migrations` sao a fonte de verdade.
- Priorizar server components; usar client components apenas quando necessario.

## Regras de Arquitetura
- `src/app`: rotas e server actions de rota.
- `src/components`: componentes de interface reutilizaveis.
- `src/lib`: integracoes, helpers e guards.
- `src/types`: tipos de aplicacao e banco.
- Centralizar acesso ao Supabase em `src/lib/supabase/*`.

## Regras de Dados e Seguranca
- Toda tabela publica deve ter RLS habilitado.
- Publico anonimo so pode ler dados ativos/permitidos do menu.
- Escrita admin controlada por `admin_users` + policies.
- Imagens no bucket publico `menu-images`, persistindo `image_path`.

## Regras de UI/UX
- Mobile-first e controles touch-friendly.
- Estados de loading, vazio e erro nas telas publicas/admin.
- Placeholder para itens sem foto.
- Interface limpa, foco em legibilidade.

## Governanca Git
### Politica de branch
- Nunca trabalhar diretamente na `main`.
- Ao iniciar qualquer tarefa, criar branch no padrao `tipo/slug-curto`.
- Tipos permitidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `hotfix`.
- `hotfix/*` somente para incidente critico e ainda via PR.

### Politica de commit
- Commits devem seguir Conventional Commits.
- Formato: `tipo(escopo-opcional): resumo`.
- Tipos permitidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`.
- Mensagem curta, no imperativo e sem ponto final.
- O resumo do commit deve ser bilingüe (ingles + pt-BR), no mesmo assunto.
- Formato recomendado do assunto:
  - `tipo(escopo): english summary / resumo em pt-BR`
- Exemplo:
  - `fix(auth): handle expired session redirect / trata redirecionamento de sessao expirada`

### Politica de push e PR
- Push direto em `main` e proibido.
- Todo push deve ir para branch de trabalho e abrir PR para `main`.
- PR deve incluir:
  - resumo do problema/solucao
  - evidencias de validacao (`pnpm lint`, `pnpm build`)
  - risco e rollback curto

### Politica de merge
- Estrategia oficial: `Squash merge`.
- Merge local para `main` nao e fluxo padrao.
- Gate minimo para merge:
  1. 1 aprovacao de review
  2. checks obrigatorios `lint` e `build`

### Regras operacionais do agente para versionamento
- Se detectar branch `main`, criar branch antes de editar arquivos.
- Antes de commit/push, sempre executar `pnpm lint` e `pnpm build`.
- Sempre sugerir e seguir fluxo de PR para `main`.
- Acionar a skill `git-workflow-guard` para qualquer tarefa de commit/branch/push/PR/merge/versionamento.

## Definition of Done
1. `/menu` carrega com categorias/itens na ordem correta.
2. Login admin funciona e rotas protegidas bloqueiam nao autenticado.
3. CRUD de categorias/itens/configuracoes funciona para admin.
4. Upload/remocao de imagem funciona no storage.
5. RLS garante leitura publica e escrita admin corretamente.
6. Deploy preview no Vercel funciona com env vars corretas.

## Disparo de Skills neste Repositorio
- `playwright`: validar fluxo UI e coletar evidencias.
- `gh-fix-ci`: investigar falhas de GitHub Actions.
- `vercel-deploy`: publicar preview/producao quando solicitado.
- `skill-creator`: criar/atualizar skills internas em `skills/`.
- `git-workflow-guard`: aplicar politicas de branch, commit, push, PR e merge em qualquer tarefa de versionamento.

## Padroes de Prompt Recomendados
- `use playwright; validar fluxo /menu mobile; sucesso = screenshot + lista de problemas`
- `use gh-fix-ci no PR <n>; resumir falha + propor correcao`
- `use vercel-deploy neste repo; retornar URL de preview`
- `use git-workflow-guard; faça commit bilíngue (english / pt-BR) e push em branch fora da main`
- `use git-workflow-guard; faça o versionamento completo (branch, lint/build, commit, push, PR)`
