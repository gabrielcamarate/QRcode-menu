---
name: "qr-menu-qa-playwright"
description: "Use when running end-to-end QA for QR menu public/admin flows with browser automation and evidence collection."
metadata:
  short-description: "Run QR menu E2E QA"
---

# QR Menu QA Playwright

## When to use
- Validation before PR merge or release.
- Reproduction of UI bugs in public or admin flows.

## Minimum flow
1. Open `/menu` and capture evidence.
2. Login at `/admin/login`.
3. Create or edit at least one category and one item.
4. Return to `/menu` and confirm reflected changes.
5. Save screenshots for public and admin pages.

## Output checklist
- Steps executed
- Evidence links/files
- Bugs found (if any)
