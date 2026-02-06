# Supabase Setup (URL e Chave Publica)

## Onde pegar no dashboard
1. Abra seu projeto no Supabase Dashboard.
2. Va em `Project Settings` -> `Data API`.
3. Copie:
- **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
- **Publishable key** -> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Variaveis esperadas no projeto
```env
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

## Compatibilidade legada
- Se voce tiver apenas a chave antiga, o projeto ainda aceita:
`NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Para novos ambientes, prefira sempre `PUBLISHABLE KEY`.

## Observacoes de seguranca
- Nao use `service_role` no frontend.
- `publishable/anon` sao chaves publicas e dependem de RLS correto.
