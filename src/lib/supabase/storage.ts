
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

async function dataUriToBlob(dataUri: string): Promise<{ blob: Blob; fileExtension: string }> {
    const response = await fetch(dataUri);
    const blob = await response.blob();
    const mimeType = blob.type;
    const fileExtension = mimeType.split('/')[1];
    if (!fileExtension || !['png', 'jpeg', 'jpg'].includes(fileExtension)) {
        throw new Error('Invalid or unsupported file type.');
    }
    return { blob, fileExtension };
}

export async function deleteFileFromSupabase(fileUrl: string, bucketName: string): Promise<void> {
    if (!fileUrl) return;

    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    
    try {
        const url = new URL(fileUrl);
        // Path is everything after the bucket name
        const filePath = url.pathname.split(`/${bucketName}/`)[1];
        
        if (!filePath) {
            console.warn(`Could not parse a valid file path from URL: ${fileUrl}`);
            return;
        }

        const { error } = await supabase.storage.from(bucketName).remove([filePath]);

        if (error) {
            // It's possible the file doesn't exist, which is not a critical error.
            if (error.message.includes("Object not found")) {
                console.warn(`File not found for deletion, which might be expected: ${filePath}`);
                return;
            }
            console.error('Supabase Storage Deletion Error:', error);
            throw new Error(`Failed to delete old file from Supabase: ${error.message}`);
        }
    } catch (e: any) {
        console.error("Error during file deletion from Supabase", e);
        // We throw so the calling function knows something went wrong.
        throw new Error(`An error occurred while trying to delete the old file: ${e.message}`);
    }
}


export async function uploadFileToSupabase(
  dataUri: string,
  bucketName: string,
  folder: string,
  currentUrl?: string | null
): Promise<string> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  
  // 1. Delete the old file if it exists
  if (currentUrl) {
    await deleteFileFromSupabase(currentUrl, bucketName);
  }

  // 2. Prepare the new file
  const { blob, fileExtension } = await dataUriToBlob(dataUri);
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
  
  // 3. Upload the new file
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false, // Important: use false to avoid overwriting and rely on unique names
    });

  if (error) {
    console.error('Supabase Storage Upload Error:', error);
    throw new Error('Failed to upload file to Supabase.');
  }

  // 4. Get the public URL of the new file
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrl;
}
