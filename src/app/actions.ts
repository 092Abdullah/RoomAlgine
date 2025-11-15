
'use server';

import { z } from 'zod';
import { generateRoomStyles, GenerateRoomStylesInput } from '@/ai/flows/generate-room-styles';
import { generateExteriorStyles, GenerateExteriorStylesInput } from '@/ai/flows/generate-exterior-styles';
import { detectRoomType } from '@/ai/flows/detect-room-type';
import { suggestStyles, SuggestStylesInput, SuggestStylesOutput } from '@/ai/flows/suggest-styles';
import { publishToGallery } from '@/ai/flows/publish-to-gallery';
import type { PublishToGalleryInput } from '@/app/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

type GeneratedImageResult = {
    style: string;
    imageDataUri: string;
};

// This action is no longer needed as uploads are handled by the publish action.
// export async function uploadOriginalImageAction(photoDataUri: string, isExterior: boolean): Promise<{ url: string } | { error: string }> {
//     try {
//         const folder = isExterior ? 'roomaigine_originals_exterior' : 'roomaigine_originals';
//         const url = await uploadToCloudinary(photoDataUri, folder);
//         return { url };
//     } catch (e: any) {
//         return { error: 'Failed to upload original image: ' + e.message };
//     }
// }


export async function generateRoomStylesAction(
  input: Omit<GenerateRoomStylesInput, 'photoDataUri'>,
  photoDataUri: string,
): Promise<{ styledRoomImages: GeneratedImageResult[] } | { error: string }> {
  if (!photoDataUri) {
    return { error: 'Please upload an image first.' };
  }
  if (input.styles.length === 0) {
    return { error: 'Please select at least one style.' };
  }
  
  try {
    const result = await generateRoomStyles({ ...input, photoDataUri });

    // Directly return the image data URI without saving anything.
    const clientResult: GeneratedImageResult[] = result.styledRoomImages.map(img => ({
      style: img.style,
      imageDataUri: img.imageDataUri,
    }));

    return { styledRoomImages: clientResult };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Error creating image, please try again.' };
  }
}

export async function generateExteriorStylesAction(
  input: Omit<GenerateExteriorStylesInput, 'photoDataUri'>,
  photoDataUri: string,
): Promise<{ styledExteriorImages: GeneratedImageResult[] } | { error: string }> {

  if (!photoDataUri) {
    return { error: 'Please upload an image first.' };
  }
  if (input.styles.length === 0) {
    return { error: 'Please select at least one style.' };
  }
  
  try {
    const result = await generateExteriorStyles({ ...input, photoDataUri });
    
    // Directly return the image data URI without saving anything.
    const clientResult: GeneratedImageResult[] = result.styledExteriorImages.map(img => ({
      style: img.style,
      imageDataUri: img.imageDataUri,
    }));

    return { styledExteriorImages: clientResult };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Error creating image, please try again.' };
  }
}

export async function detectRoomTypeAction(
    photoDataUri?: string | null
): Promise<{ roomType: string } | { error: string }> {
    if (!photoDataUri) {
        return { error: 'Please upload an image first.' };
    }

    try {
        const result = await detectRoomType({ photoDataUri });
        const formattedRoomType = result.roomType.toLowerCase().replace(/\s+/g, '-');
        return { roomType: formattedRoomType };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'Error detecting room type.' };
    }
}

export async function suggestStylesAction(
  input: SuggestStylesInput
): Promise<SuggestStylesOutput | { error: string }> {
  if (!input.photoDataUri) {
    return { error: 'Please upload an image first.' };
  }

  try {
    const result = await suggestStyles(input);
    return result;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Error suggesting styles.' };
  }
}

export async function publishToGalleryAction(
  input: PublishToGalleryInput
): Promise<{ success: boolean; galleryUrl?: string; creationId?: string; error?: string }> {
  try {
    const result = await publishToGallery(input);
    revalidatePath('/gallery');
    return { success: true, galleryUrl: result.galleryUrl, creationId: result.creationId };
  } catch (e: any)    {
    console.error('Publishing failed:', e);
    return { success: false, error: e.message || 'Failed to publish to gallery.' };
  }
}

export async function deleteCreationAction(creationId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    try {
        // We need to fetch the image URLs to delete them from Cloudinary
        const { data: creation, error: fetchError } = await supabase
            .from('creations')
            .select('original_image_url, generated_image_url')
            .eq('id', creationId)
            .single();

        if (fetchError || !creation) {
            throw new Error('Creation not found.');
        }

        // Delete from DB first
        const { error } = await supabase.from('creations').delete().eq('id', creationId);
        if (error) throw error;
        
        // Then delete from Cloudinary
        await Promise.allSettled([
            deleteFromCloudinary(creation.original_image_url),
            deleteFromCloudinary(creation.generated_image_url)
        ]);
        
        revalidatePath('/gallery');
        return { success: true };
    } catch (e: any) {
        console.error('Failed to delete creation:', e);
        return { success: false, error: e.message || 'Could not delete the creation.' };
    }
}

// This action is now obsolete since the 'designs' table is no longer used for temporary storage.
export async function deleteDesignAction(designId: string): Promise<{ success: boolean; error?: string }> {
    console.warn("deleteDesignAction is obsolete and should not be called.");
    return { success: false, error: "This function is obsolete." };
}

export async function incrementKudosAction(creationId: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  try {
    const { error } = await supabase.rpc('increment_kudos', { creation_id: creationId });
    if (error) throw error;
    revalidatePath('/gallery');
    return { success: true };
  } catch (e: any) {
    console.error('Failed to increment kudos:', e);
    return { success: false, error: e.message || 'Could not update kudos count.' };
  }
}

export async function updateUserAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'User profiles are disabled.' };
}
