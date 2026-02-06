# QRcode-menu

Aplicacao web de cardapio digital para restaurante, com experiencia mobile-first via QR Code.

O visitante acessa o menu sem login e navega por categorias e itens.  
O cliente administra o conteudo em painel protegido, com controle de categorias, itens, disponibilidade, ordenacao e imagens.

## Visao do Produto
- Modelo: restaurante unico (sem multi-tenant no MVP).
- Canal publico: `/menu`.
- Canal administrativo: `/admin/*`.
- Objetivo: simplicidade operacional, boa performance e manutencao previsivel.

## Escopo do MVP
### Inclui
- Menu publico com categorias e itens ordenados.
- Painel admin com login para CRUD de categorias, itens e configuracoes.
- Upload/remocao de imagens.
- Regras de seguranca com RLS no banco.

### Nao inclui
- Carrinho.
- Checkout.
- Pagamentos.
- Pedidos online.

## Arquitetura
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS.
- Backend e dados: Supabase (Postgres, Auth, Storage).
- Seguranca: Row Level Security (RLS) nas tabelas publicas.
- Deploy: Vercel (app) + Supabase Cloud (infra de dados).

## Estrutura de Rotas
- Publico:
  - `/menu`
- Admin:
  - `/admin/login`
  - `/admin`
  - `/admin/categories`
  - `/admin/items`
  - `/admin/settings`

## Modelagem Principal
- `categories`: categorias do cardapio com ordem e status.
- `items`: itens vinculados a categorias, com preco opcional e disponibilidade.
- `settings`: configuracoes globais do restaurante (singleton).
- `admin_users`: usuarios autorizados para escrita no painel.

## Documentacao Tecnica
- Especificacao do produto: `docs/project-spec.md`
- Workflow de versionamento: `docs/git-workflow.md`
- Catalogo de commits: `docs/commit-message-catalog.md`
