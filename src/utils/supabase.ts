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
): Promise<ResultUploadFiles> {
  const results: ResultUploadFiles = [];
  for (const file of files) {
    // Validate file type and size
    const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedFileTypes.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`);
      results.push({
        photoUrl: { data: { publicUrl: "" } },
        success: false,
      });
      continue;
    }
    if (file.size > 5 * 1024 * 1024) {
      console.error(`File size exceeds the limit of 5MB: ${file.name}`);
      results.push({
        photoUrl: { data: { publicUrl: "" } },
        success: false,
      });
      continue;
    }
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${dir}/${fileName}`;
    const buffer = await file.arrayBuffer();
    const { error } = await supabase.storage
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
): Promise<ResultRemoveFiles> {
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
    const { error } = await supabase.storage
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
