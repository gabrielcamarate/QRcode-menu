# AGENTS.md (Resumo de Uso)

## Para que serve
- Define as regras operacionais do agente dentro deste repositorio.
- Garante consistencia de arquitetura, seguranca e escopo do MVP.

## Pontos principais
1. Responder sempre em pt-BR.
2. Foco no MVP do cardapio (menu publico + painel admin).
3. Sem carrinho/pagamento/pedidos/multi-tenant no MVP.
4. Stack fixa: Next.js + TypeScript + Tailwind + Supabase.
5. RLS obrigatorio e migrations SQL como fonte de verdade.
6. Uso de skills por contexto para acelerar execucao com qualidade.

## Como usar no dia a dia
1. Antes da task: confirmar se esta dentro do escopo do MVP.
2. Durante: escolher skill adequada e declarar criterio de sucesso.
3. Antes de concluir: checar Definition of Done do `AGENTS.md`.
