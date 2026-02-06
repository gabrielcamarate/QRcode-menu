# Go-live Checklist (Operacao Real)

## Objetivo
Garantir que o cardapio esteja pronto para uso diario do restaurante com seguranca, previsibilidade e experiencia mobile consistente.

## 1) Carga inicial do restaurante
1. Ajustar e executar `supabase/seeds/go-live-template.sql` no SQL Editor do Supabase.
2. Confirmar `settings`:
   - `restaurant_name`
   - `primary_color` (opcional)
   - `show_unavailable_items`
3. Confirmar categorias ativas e ordenadas por `sort_order`.
4. Confirmar itens por categoria com:
   - nome
   - descricao (opcional)
   - preco (opcional)
   - disponibilidade
   - ordenacao

## 2) Validacao de seguranca (RLS)
### Validacao automatizada (recomendada)
Rodar:

```bash
node scripts/validate-security.mjs
```

Resultado esperado minimo:
- `PUBLIC_READ_SETTINGS` = OK
- `PUBLIC_READ_CATEGORIES` = OK
- `ANON_WRITE_BLOCK` = OK

### Validacao com usuarios autenticados (opcional, porem recomendada)
Defina no `.env.local`:
- `NON_ADMIN_EMAIL` e `NON_ADMIN_PASSWORD`
- `ADMIN_EMAIL` e `ADMIN_PASSWORD`

Execute novamente `node scripts/validate-security.mjs`.

Resultado esperado:
- `NON_ADMIN_WRITE_BLOCK` = OK
- `ADMIN_WRITE_ALLOWED` = OK

## 3) QA funcional ponta a ponta
1. Login em `/admin/login` com usuario admin.
2. Criar categoria, editar, desativar/ativar e remover.
3. Criar item com e sem preco.
4. Criar item com foto e depois remover.
5. Alterar `show_unavailable_items` em `/admin/settings`.
6. Validar reflexo no `/menu`:
   - ordenacao de categorias
   - ordenacao de itens
   - item sem preco nao mostra valor
   - comportamento de indisponivel conforme configuracao

## 4) Ajustes de UX bloqueantes
Antes de go-live, confirmar:
1. Toda acao critica exibe feedback de sucesso/erro.
2. Estados vazios estao claros (sem categoria, sem item).
3. Validacao de campos obrigatorios funcionando.
4. Upload de imagem com erro tratado (arquivo invalido/tamanho).

## 5) Gate de qualidade
Executar antes de publicar:

```bash
pnpm lint
pnpm build
```

## 6) Aceite final
Checklist de aceite:
- [ ] Admin faz CRUD sem erro silencioso.
- [ ] Menu publico reflete alteracoes sem inconsistencias.
- [ ] Regras de indisponibilidade estao corretas.
- [ ] Escrita anonima bloqueada por RLS.
- [ ] Escrita de nao-admin bloqueada.
- [ ] Escrita de admin permitida.
- [ ] Upload/remocao de imagem validado.
- [ ] `pnpm lint` e `pnpm build` aprovados.
