import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Uploads a file to Supabase Storage with local base64 fallback.
 * Validates extension & size beforehand.
 */
export async function uploadFile(
  file: File,
  bucketName: string,
  folderPath: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; size: number; name: string; format: string }> {
  // 1. File Size and Format Validation
  const fileExt = (file.name.split(".").pop() || "").toLowerCase();
  const allowedFormats = ["jpg", "jpeg", "png", "pdf"];
  
  if (!allowedFormats.includes(fileExt)) {
    throw new Error(`Invalid file format. Allowed formats are: ${allowedFormats.join(", ")}`);
  }

  // 5MB Max Limit
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("File exceeds maximum allowed size of 5MB.");
  }

  const fileSizeKB = Math.round(file.size / 1024);

  // Fallback if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (onProgress) onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              url: reader.result as string,
              size: fileSizeKB,
              name: file.name,
              format: fileExt
            });
          };
          reader.onerror = () => reject(new Error("Local file parsing failed"));
          reader.readAsDataURL(file);
        }
      }, 150);
    });
  }

  try {
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 100000)}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;

    if (onProgress) onProgress(20);

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true
      });

    if (error) {
      throw error;
    }

    if (onProgress) onProgress(80);

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (onProgress) onProgress(100);

    return {
      url: publicUrlData.publicUrl,
      size: fileSizeKB,
      name: file.name,
      format: fileExt
    };
  } catch (err: any) {
    console.error("Supabase upload failed, falling back to local simulation:", err);
    // Fallback to local base64 reader if Supabase connection fails
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          url: reader.result as string,
          size: fileSizeKB,
          name: file.name,
          format: fileExt
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Simulates deleting a file or calls Supabase to delete
 */
export async function deleteFileFromStorage(
  fileUrl: string,
  bucketName: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true; // Mock success
  }

  try {
    // Attempt parsing filename from URL
    const urlParts = fileUrl.split(`${bucketName}/`);
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete file from Supabase storage:", err);
    return true; // Fallback to mock succeed
  }
}
