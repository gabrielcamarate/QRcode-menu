---
name: "menu-admin-crud"
description: "Use when building or refactoring admin CRUD screens for categories/items/settings in QRcode-menu; enforces consistent fields, validation, and feedback states."
---

# Menu Admin CRUD

Apply this skill to `/admin/categories`, `/admin/items`, and `/admin/settings` changes.

## Required checks
1. Fields match DB schema.
2. Required fields enforce validation.
3. Create/update/delete actions revalidate `/admin/*` and `/menu`.
4. Every form has loading/error/success handling strategy.
5. Availability and ordering controls remain exposed in UI.
