---
name: "nextjs-app-router-structure"
description: "Use when reorganizing routes/components in this Next.js App Router project to keep server-first components, clear boundaries, and typed data flow."
---

# Next.js App Router Structure

Use this skill when adding routes, layouts, or shared components.

## Rules
1. Keep server components as default.
2. Add `"use client"` only for browser-only behavior.
3. Keep route logic in `src/app`, reusable UI in `src/components`.
4. Keep Supabase helpers in `src/lib/supabase`.
5. Keep shared types in `src/types`.
