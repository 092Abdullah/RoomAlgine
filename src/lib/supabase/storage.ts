
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

async function dataUriToBlob(dataUri: string): Promise<{ blob: Blob; fileExtension: string }> {
    const response = await fetch(dataUri);
    const blob = await response.blob();
    const mimeType = blob.type;
    const fileExtension = mimeType.split('/')[1];
    if (!fileExtension) {
        throw new Error('Could not determine file extension from MIME type.');
    }
    return { blob, fileExtension };
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
    try {
      await deleteFileFromSupabase(currentUrl, bucketName);
    } catch (e) {
      // Log the warning but don't block the upload
      console.warn("Failed to delete old file, continuing with upload:", e);
    }
  }

  // 2. Convert data URI to Blob and prepare the new file path
  const { blob, fileExtension } = await dataUriToBlob(dataUri);
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
  
  // 3. Upload the new file
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false, // Use false for new unique files, true if you want to overwrite by name
    });

  if (error) {
    console.error('Supabase Storage Upload Error:', error);
    throw new Error('Failed to upload file to Supabase.');
  }

  // 4. Get the public URL of the newly uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteFileFromSupabase(fileUrl: string, bucketName: string): Promise<void> {
    if (!fileUrl) return;

    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    
    // Extract the file path from the full URL
    // e.g., https://<project>.supabase.co/storage/v1/object/public/avatars/user_123/abc.png -> avatars/user_123/abc.png
    const urlParts = fileUrl.split(`/storage/v1/object/public/${bucketName}/`);
    const filePath = urlParts[1];

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
        throw new Error('Failed to delete file from Supabase.');
    }
}
