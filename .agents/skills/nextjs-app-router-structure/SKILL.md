---
name: "nextjs-app-router-structure"
description: "Use when adding or refactoring routes/components in this Next.js App Router codebase; enforce server-first boundaries and predictable folder structure."
metadata:
  short-description: "Keep App Router structure clean"
---

# Next.js App Router Structure

## When to use
- Route/layout/component organization changes.

## Rules
1. Prefer Server Components.
2. Add `"use client"` only when browser-only behavior is required.
3. Keep route logic in `src/app`.
4. Keep reusable UI in `src/components`.
5. Keep integrations/helpers in `src/lib`.
6. Keep shared types in `src/types`.

## Output checklist
- Correct server/client boundary
- Files in proper folders
- Type reuse preserved
