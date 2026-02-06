create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  price numeric(10,2),
  image_path text,
  sort_order int not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint items_slug_unique_per_category unique(category_id, slug)
);

create table if not exists public.settings (
  id uuid primary key default '00000000-0000-0000-0000-000000000001',
  restaurant_name text not null,
  logo_path text,
  cover_path text,
  primary_color text,
  show_unavailable_items boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = '00000000-0000-0000-0000-000000000001')
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists categories_active_sort_idx on public.categories(is_active, sort_order);
create index if not exists items_category_availability_sort_idx on public.items(category_id, is_available, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create trigger trg_items_updated_at
before update on public.items
for each row
execute function public.set_updated_at();

create trigger trg_settings_updated_at
before update on public.settings
for each row
execute function public.set_updated_at();

create or replace function public.app_is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.admin_users au
    where au.user_id = uid
  );
$$;

create or replace function public.app_show_unavailable_items()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select s.show_unavailable_items
      from public.settings s
      where s.id = '00000000-0000-0000-0000-000000000001'
    ),
    true
  );
$$;

alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.settings enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists categories_public_select on public.categories;
create policy categories_public_select
on public.categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists items_public_select on public.items;
create policy items_public_select
on public.items
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.categories c
    where c.id = category_id
      and c.is_active = true
  )
  and (
    is_available = true
    or public.app_show_unavailable_items() = true
  )
);

drop policy if exists settings_public_select on public.settings;
create policy settings_public_select
on public.settings
for select
to anon, authenticated
using (true);

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all
on public.categories
for all
to authenticated
using (public.app_is_admin(auth.uid()))
with check (public.app_is_admin(auth.uid()));

drop policy if exists items_admin_all on public.items;
create policy items_admin_all
on public.items
for all
to authenticated
using (public.app_is_admin(auth.uid()))
with check (public.app_is_admin(auth.uid()));

drop policy if exists settings_admin_all on public.settings;
create policy settings_admin_all
on public.settings
for all
to authenticated
using (public.app_is_admin(auth.uid()))
with check (public.app_is_admin(auth.uid()));

drop policy if exists admin_users_admin_all on public.admin_users;
create policy admin_users_admin_all
on public.admin_users
for all
to authenticated
using (public.app_is_admin(auth.uid()))
with check (public.app_is_admin(auth.uid()));

insert into public.settings (id, restaurant_name, show_unavailable_items)
values ('00000000-0000-0000-0000-000000000001', 'Cardapio Digital', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

drop policy if exists menu_images_public_read on storage.objects;
create policy menu_images_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'menu-images');

drop policy if exists menu_images_admin_write on storage.objects;
create policy menu_images_admin_write
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'menu-images'
  and public.app_is_admin(auth.uid())
);

drop policy if exists menu_images_admin_update on storage.objects;
create policy menu_images_admin_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'menu-images'
  and public.app_is_admin(auth.uid())
)
with check (
  bucket_id = 'menu-images'
  and public.app_is_admin(auth.uid())
);

drop policy if exists menu_images_admin_delete on storage.objects;
create policy menu_images_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'menu-images'
  and public.app_is_admin(auth.uid())
);
