---
name: "menu-image-pipeline"
description: "Use when implementing image upload, update, or deletion for menu items; enforce storage path conventions, validation, and fallback rendering."
metadata:
  short-description: "Standardize menu images"
---

# Menu Image Pipeline

## When to use
- Any change in item image upload/remove/display flow.

## Standards
1. Persist only `image_path` in DB.
2. Use bucket `menu-images` with item paths under `items/`.
3. Validate mime type and max size before upload.
4. Remove storage object when item is deleted (best effort with clear feedback).
5. Render placeholder when image is missing.

## Output checklist
- Upload validation
- Storage path consistency
- Delete cleanup behavior
- Public menu fallback rendering
