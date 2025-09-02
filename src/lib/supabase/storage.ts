
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

export async function deleteFileFromSupabase(fileUrl: string, bucketName: string): Promise<void> {
    if (!fileUrl) return;

    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    
    try {
        const url = new URL(fileUrl);
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
            throw new Error('Failed to delete file from Supabase.');
        }
    } catch (e) {
        console.error("Error parsing URL or deleting from Supabase", e);
        // Don't re-throw, to avoid blocking the upload of a new file.
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
  
  if (currentUrl) {
    await deleteFileFromSupabase(currentUrl, bucketName);
  }

  const { blob, fileExtension } = await dataUriToBlob(dataUri);
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false, 
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
