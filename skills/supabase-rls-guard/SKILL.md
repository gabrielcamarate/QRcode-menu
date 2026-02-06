---
name: "supabase-rls-guard"
description: "Use when updating Supabase schema/RLS policies for this QR menu project; prefer Supabase MCP for inspection, verify policy coverage for public read and admin write, and flag exposure risks."
---

# Supabase RLS Guard

Use this skill whenever schema or policy changes touch `categories`, `items`, `settings`, `admin_users`, or `storage.objects` for `menu-images`.

## Workflow
1. Prefer Supabase MCP to inspect live project state (tables, policies, RLS status) when available.
2. Compare live state with latest SQL migration in `supabase/migrations`.
3. Confirm RLS is enabled for every public table.
4. Validate policy intent:
   - public read for active menu data
   - admin-only write via `app_is_admin(auth.uid())`
5. Flag any policy granting broad write access to `authenticated` or `anon`.
6. Return a short risk report with exact SQL lines to change.

## MCP-First Guidance
1. If Supabase MCP is configured, use MCP inspection first to reduce drift between migration and production.
2. If MCP is unavailable, fallback to SQL-only review and mark the report as "migration-based, live state not verified".
3. Keep outputs objective: table, policy, risk, impact, and suggested fix SQL.
