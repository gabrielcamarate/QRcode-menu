export type UUID = string;

export type Category = {
  id: UUID;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuItem = {
  id: UUID;
  category_id: UUID;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  image_path: string | null;
  sort_order: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type Settings = {
  id: UUID;
  restaurant_name: string;
  logo_path: string | null;
  cover_path: string | null;
  primary_color: string | null;
  show_unavailable_items: boolean;
  updated_at: string;
};

export type CategoryWithItems = Category & {
  items: MenuItem[];
};
