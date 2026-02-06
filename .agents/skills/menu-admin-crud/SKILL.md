---
name: "menu-admin-crud"
description: "Use when implementing or refactoring admin CRUD for categories, items, and settings; enforce schema alignment, validation, and UX feedback states."
metadata:
  short-description: "Standardize admin CRUD"
---

# Menu Admin CRUD

## When to use
- Changes in `/admin/categories`, `/admin/items`, `/admin/settings`.

## Required checks
1. Form fields match DB schema.
2. Required fields are validated.
3. Actions return visible success/error feedback.
4. Loading/empty/error states are present.
5. `revalidatePath` covers both admin and `/menu` when data changes.
6. Ordering and availability controls remain editable.

## Output checklist
- CRUD behavior validated
- Error and empty states covered
- Revalidation paths confirmed
