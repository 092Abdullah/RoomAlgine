
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

async function dataUriToBlob(dataUri: string): Promise<Blob> {
    const response = await fetch(dataUri);
    const blob = await response.blob();
    return blob;
}

export async function uploadFileToSupabase(
  dataUri: string,
  bucketName: string,
  folder: string,
  currentUrl?: string | null
): Promise<string> {
  const supabase = await createSupabaseServerClient();
  
  if (currentUrl) {
    try {
      await deleteFileFromSupabase(currentUrl, bucketName);
    } catch (e) {
      console.warn("Failed to delete old file, continuing with upload:", e);
    }
  }

  const blob = await dataUriToBlob(dataUri);
  const fileExtension = blob.type.split('/')[1];
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: true, // Overwrite file if it exists, good for avatars
    });

  if (error) {
    console.error('Supabase Storage Upload Error:', error);
    throw new Error('Failed to upload file to Supabase.');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteFileFromSupabase(fileUrl: string, bucketName: string): Promise<void> {
    if (!fileUrl) return;

    const supabase = await createSupabaseServerClient();
    const filePath = new URL(fileUrl).pathname.split(`/${bucketName}/`)[1];

    if (!filePath) {
        console.warn(`Could not parse file path from URL: ${fileUrl}`);
        return;
    }

    const { error } = await supabase.storage.from(bucketName).remove([filePath]);

    if (error) {
        console.error('Supabase Storage Deletion Error:', error);
        throw new Error('Failed to delete file from Supabase.');
    }
}
