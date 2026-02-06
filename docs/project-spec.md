# QRcode-menu Project Spec (MVP)

## Product Summary
Single-restaurant QR menu with no cart/checkout. Visitors access a public menu without login. A protected admin panel manages categories, items, and restaurant settings.

## Final MVP Decisions
1. Public menu is a single page at `/menu` with category sections.
2. Unavailable item behavior is configurable by setting `show_unavailable_items`.
3. Multiple admins are supported for the same restaurant (no role hierarchy).
4. Slugs are required for categories and items.
5. Supabase SQL migrations in Git are the source of truth.

## Data Model
### categories
- `id uuid pk`
- `name text not null`
- `slug text not null unique`
- `sort_order int default 0`
- `is_active boolean default true`
- timestamps

### items
- `id uuid pk`
- `category_id uuid fk -> categories.id on delete restrict`
- `name text not null`
- `slug text not null`
- `description text null`
- `price numeric(10,2) null`
- `image_path text null`
- `sort_order int default 0`
- `is_available boolean default true`
- timestamps
- `unique(category_id, slug)`

### settings (singleton)
- `id uuid pk fixed value`
- `restaurant_name text not null`
- `logo_path text null`
- `cover_path text null`
- `primary_color text null`
- `show_unavailable_items boolean default true`
- `updated_at`

### admin_users
- `user_id uuid pk references auth.users(id)`
- `created_at`

## Routes
### Public
- `/menu`

### Admin
- `/admin/login`
- `/admin`
- `/admin/categories`
- `/admin/items`
- `/admin/settings`

## Security and Access
- Public (anon): read-only, filtered by RLS.
- Admin users: full CRUD on categories/items/settings.
- Admin membership is checked through `admin_users`.

## Storage
- Public bucket: `menu-images`.
- Persist `image_path` in DB.
- Generate public URL at runtime.

## Non-Functional Requirements
- Mobile-first and performant on 3G/4G.
- Optimized image rendering and lazy loading.
- Clear loading/error states.

## Deploy
- Web: Vercel
- Backend: Supabase Cloud
- CI path: GitHub -> Vercel preview deployments
