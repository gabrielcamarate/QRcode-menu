import { createClient } from "./server";

const BUCKET = "menu-images";

export async function uploadMenuImage(file: File) {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `items/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
}

export async function removeMenuImage(filePath: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);

  if (error) {
    throw new Error(error.message);
  }
}

export function getMenuImageUrl(filePath: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return "";
  }

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`;
}
