import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a file to the given bucket at the given path and returns its public URL.
 * Throws on upload error.
 */
export async function uploadImage(
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean },
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options?.upsert ?? false,
      contentType: file.type,
    });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
