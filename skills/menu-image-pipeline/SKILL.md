---
name: "menu-image-pipeline"
description: "Use when implementing image upload/remove flows for menu items; standardizes storage path, validation, and fallback rendering for missing images."
---

# Menu Image Pipeline

Use this skill for image handling in admin and public menu views.

## Standards
1. Store only `image_path` in DB.
2. Keep files inside `menu-images/items/`.
3. Validate mime type and max file size before upload.
4. Remove storage object when item is deleted.
5. Render placeholder when `image_path` is null.
