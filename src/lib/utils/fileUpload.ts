import { supabase } from "../supabase";

/**
 * Uploads a file to Supabase storage and returns the public URL
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param path The path within the bucket where the file should be stored
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path: string,
): Promise<string> {
  try {
    // Create the full path including filename
    const filePath = `${path}/${file.name}`;

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Deletes a file from Supabase storage
 * @param bucket The storage bucket name
 * @param path The full path to the file including filename
 * @returns True if deletion was successful
 */
export async function deleteFile(
  bucket: string,
  path: string,
): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * Extracts the filename from a full file path or URL
 * @param path The full file path or URL
 * @returns The filename
 */
export function getFilenameFromPath(path: string): string {
  if (!path) return "";

  // Handle URLs
  if (path.includes("://")) {
    const url = new URL(path);
    const pathname = url.pathname;
    return pathname.substring(pathname.lastIndexOf("/") + 1);
  }

  // Handle regular paths
  return path.substring(path.lastIndexOf("/") + 1);
}
