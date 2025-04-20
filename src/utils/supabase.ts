import { supabase } from "@/lib/supabaseClient";
import { ResultRemoveFiles, ResultUploadFiles } from "@/../types/supabase";

/**
 * Upload a single or multiple files to Supabase storage.
 * @param bucketName - The name of the storage bucket.
 * @param files - An array of files to upload.
 * @param dir - The directory path within the bucket where the files will be uploaded.
 * @returns A promise with the upload results.
 */
export async function uploadFiles(
  bucketName: string,
  files: File[],
  dir: string
): Promise<any[]> {
  const results: ResultUploadFiles = [];
  for (const file of files) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${dir}/${fileName}`;
    const buffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, new Uint8Array(buffer), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      results.push({
        photoUrl: supabase.storage.from(bucketName).getPublicUrl(filePath),
        success: false,
      });
    } else {
      results.push({
        photoUrl: supabase.storage.from(bucketName).getPublicUrl(filePath),
        success: true,
      });
    }
  }
  return results;
}

/**
 * Delete a single or multiple files from Supabase storage.
 * @param bucketName - The name of the storage bucket.
 * @param fileNames - An array of file names to delete.
 * @returns A promise with the deletion results.
 */
export async function removeFiles(
  bucketName: string,
  photoUrl: string[]
): Promise<any[]> {
  const results: ResultRemoveFiles = [];
  if (!photoUrl || photoUrl.length === 0) {
    return [];
  }
  // Iterate over each URL and delete the corresponding file
  for (const url of photoUrl) {
    const filePath = url.split("/").slice(8).join("/");
    if (!filePath) {
      console.error("Invalid photo URL:", url);
      continue;
    }
    // Assuming the file path is in the format "uploads/{dir}/{fileName}"
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    if (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      results.push({ file: filePath, success: false });
    } else {
      results.push({ file: filePath, success: true });
    }
  }

  return results;
}
