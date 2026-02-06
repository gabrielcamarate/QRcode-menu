-- Go-live template
-- Ajuste os valores para o restaurante antes de executar.

insert into public.settings (id, restaurant_name, primary_color, show_unavailable_items)
values (
  '00000000-0000-0000-0000-000000000001',
  'NOME_DO_RESTAURANTE',
  '#0F172A',
  true
)
on conflict (id) do update
set
  restaurant_name = excluded.restaurant_name,
  primary_color = excluded.primary_color,
  show_unavailable_items = excluded.show_unavailable_items;

-- Categorias iniciais
insert into public.categories (name, slug, sort_order, is_active)
values
  ('Entradas', 'entradas', 10, true),
  ('Pratos Principais', 'pratos-principais', 20, true),
  ('Sobremesas', 'sobremesas', 30, true),
  ('Bebidas', 'bebidas', 40, true)
on conflict (slug) do nothing;

-- Itens iniciais (ajuste descricoes, valores e disponibilidade)
insert into public.items (category_id, name, slug, description, price, sort_order, is_available)
select c.id, i.name, i.slug, i.description, i.price, i.sort_order, i.is_available
from (
  values
    ('entradas', 'Bruschetta', 'bruschetta', 'Pao italiano com tomate e manjericao', 29.90, 10, true),
    ('pratos-principais', 'Risoto de Cogumelos', 'risoto-de-cogumelos', 'Arroz arboreo com mix de cogumelos', 59.90, 10, true),
    ('sobremesas', 'Cheesecake', 'cheesecake', 'Cheesecake com calda de frutas vermelhas', 24.90, 10, true),
    ('bebidas', 'Limonada', 'limonada', 'Limonada da casa', 12.00, 10, true)
) as i(category_slug, name, slug, description, price, sort_order, is_available)
join public.categories c on c.slug = i.category_slug
on conflict (category_id, slug) do nothing;

-- Promova um usuario admin existente no Auth (substitua pelo UUID correto)
-- insert into public.admin_users (user_id)
-- values ('UUID_DO_USUARIO_ADMIN')
-- on conflict (user_id) do nothing;
