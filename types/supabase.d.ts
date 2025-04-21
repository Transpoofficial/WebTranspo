export type ResultUploadFiles = {
  photoUrl: { data: { publicUrl: string } };
  success: boolean;
}[];
export type ResultRemoveFiles = { file: string; success: boolean }[];
