---
name: "supabase-rls-guard"
description: "Use when changing Supabase schema or RLS for menu data; verify policy coverage for public read and admin write, preferably against live state via MCP."
metadata:
  short-description: "Validate Supabase RLS safety"
---

# Supabase RLS Guard

## When to use
- Any migration/policy change touching `categories`, `items`, `settings`, `admin_users`, or menu image access.

## Workflow
1. Prefer Supabase MCP to inspect live tables/policies.
2. Compare live state with `supabase/migrations` SQL.
3. Confirm RLS enabled on all public tables.
4. Validate intended permissions:
   - anon/public read only where expected
   - write only for admin rule (`admin_users`/guard function)
5. Flag broad write grants to `anon` or `authenticated`.

## Output checklist
- Table-by-table policy status
- Risk summary
- Exact SQL fix suggestions (if needed)
- Note whether validation was live (MCP) or migration-only
