---
name: "qr-menu-qa-playwright"
description: "Use when validating end-to-end behavior of public menu and admin panel flows in QRcode-menu using Playwright CLI automation."
---

# QR Menu QA Playwright

Run this skill for release validation or regression checks.

## Minimum flow
1. Open `/menu` and capture screenshot.
2. Login on `/admin/login`.
3. Create or edit one category and one item.
4. Return to `/menu` and confirm reflection of changes.
5. Save final evidence screenshots for menu and admin pages.
