
'use server';

import { z } from 'zod';
import { generateRoomStyles, GenerateRoomStylesInput } from '@/ai/flows/generate-room-styles';
import { generateExteriorStyles, GenerateExteriorStylesInput } from '@/ai/flows/generate-exterior-styles';
import { detectRoomType } from '@/ai/flows/detect-room-type';
import { suggestStyles, SuggestStylesInput, SuggestStylesOutput } from '@/ai/flows/suggest-styles';
import { publishToGallery } from '@/ai/flows/publish-to-gallery';
import type { PublishToGalleryInput } from '@/app/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isToday } from 'date-fns';
import type { SupabaseClient } from '@supabase/supabase-js';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';
import { uploadFileToSupabase, deleteFileFromSupabase } from '@/lib/supabase/storage';
import { cookies } from 'next/headers';

type GeneratedImageResult = {
    designId: string;
    style: string;
    imageDataUri: string;
};

export async function uploadOriginalImageAction(photoDataUri: string, isExterior: boolean): Promise<{ url: string } | { error: string }> {
    try {
        const folder = isExterior ? 'roomaigine_originals_exterior' : 'roomaigine_originals';
        const url = await uploadToCloudinary(photoDataUri, folder);
        return { url };
    } catch (e: any) {
        return { error: 'Failed to upload original image: ' + e.message };
    }
}


export async function generateRoomStylesAction(
  input: Omit<GenerateRoomStylesInput, 'photoDataUri'>,
  photoDataUri: string,
  originalImageUrl: string
): Promise<{ styledRoomImages: GeneratedImageResult[] } | { error: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  
  if (!photoDataUri) {
    return { error: 'Please upload an image first.' };
  }
  if (!originalImageUrl) {
      return { error: 'Original image URL is missing. Please re-upload.' };
  }
  if (input.styles.length === 0) {
    return { error: 'Please select at least one style.' };
  }
  
  try {
    const result = await generateRoomStyles({ ...input, photoDataUri });

    const savedDesigns: GeneratedImageResult[] = [];

    for (const image of result.styledRoomImages) {
        if (!image.imageDataUri) {
            console.warn(`Skipping style "${image.style}" due to missing image data.`);
            continue;
        }

        const generatedImageUrl = await uploadToCloudinary(image.imageDataUri, 'roomaigine_generated');
        
        if (!generatedImageUrl) {
             console.error(`Skipping style "${image.style}" because Cloudinary upload failed.`);
             continue;
        }

        // We still save to the 'designs' table but without a user_id. 
        // This is for potential features like "share by link".
        const { data: savedDesign, error: dbError } = await supabase
            .from('designs')
            .insert({
                // user_id is now omitted and allowed to be NULL in DB
                original_image_url: originalImageUrl,
                generated_image_url: generatedImageUrl,
                style: image.style,
                room_type: input.roomType,
                config: { ...input, styles: [image.style] }
            })
            .select('id, style')
            .single();

        if (dbError) {
            console.error('Failed to save design:', dbError);
            // Even if DB save fails, we should return the generated image to the user.
            // But we can't publish it later. For now, we will skip it on DB error.
             continue;
        } else if (savedDesign) {
            savedDesigns.push({
                designId: savedDesign.id,
                style: savedDesign.style,
                imageDataUri: image.imageDataUri,
            });
        }
    }

    if (result.styledRoomImages.length > 0 && savedDesigns.length === 0) {
      // This means image generation worked, but all DB inserts failed.
      return { error: 'Could not save the generated designs. Please try again.' };
    }

    return { styledRoomImages: savedDesigns };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Error creating image, please try again.' };
  }
}

export async function generateExteriorStylesAction(
  input: Omit<GenerateExteriorStylesInput, 'photoDataUri'>,
  photoDataUri: string,
  originalImageUrl: string
): Promise<{ styledExteriorImages: GeneratedImageResult[] } | { error: string }> {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  if (!photoDataUri) {
    return { error: 'Please upload an image first.' };
  }
  if (!originalImageUrl) {
      return { error: 'Original image URL is missing. Please re-upload.' };
  }
  if (input.styles.length === 0) {
    return { error: 'Please select at least one style.' };
  }
  
  try {
    const result = await generateExteriorStyles({ ...input, photoDataUri });
    
    const savedDesigns: GeneratedImageResult[] = [];

    for (const image of result.styledExteriorImages) {
        if (!image.imageDataUri) {
            console.warn(`Skipping style "${image.style}" due to missing image data.`);
            continue;
        }
        
        const generatedImageUrl = await uploadToCloudinary(image.imageDataUri, 'roomaigine_generated_exterior');
        
        if (!generatedImageUrl) {
            console.error(`Skipping style "${image.style}" because Cloudinary upload failed.`);
            continue;
        }

        const { data: savedDesign, error: dbError } = await supabase
            .from('designs')
            .insert({
                // user_id is omitted and allowed to be NULL in DB
                original_image_url: originalImageUrl,
                generated_image_url: generatedImageUrl,
                style: image.style,
                config: { ...input, styles: [image.style] }
            })
            .select('id, style')
            .single();

        if (dbError) {
            console.error('Failed to save exterior design:', dbError);
            continue;
        } else if (savedDesign) {
            savedDesigns.push({
                designId: savedDesign.id,
                style: savedDesign.style,
                imageDataUri: image.imageDataUri,
            });
        }
    }
    
    if (result.styledExteriorImages.length > 0 && savedDesigns.length === 0) {
      return { error: 'Could not save the generated exterior designs. Please try again.' };
    }

    return { styledExteriorImages: savedDesigns };
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

// "My Designs" is no longer a user-specific concept, so deleting a single design
// from the temporary `designs` table isn't a primary feature.
// This function can be removed or disabled if there's no UI for it.
// For now, it's left here but might be unused.
export async function deleteDesignAction(designId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    try {
        const { data: design, error: fetchError } = await supabase
            .from('designs')
            .select('original_image_url, generated_image_url')
            .eq('id', designId)
            .single();

        if (fetchError || !design) {
            throw new Error('Design not found.');
        }

        const [originalDeletion, generatedDeletion] = await Promise.allSettled([
            deleteFromCloudinary(design.original_image_url),
            deleteFromCloudinary(design.generated_image_url)
        ]);

        if (originalDeletion.status === 'rejected') {
            console.warn(`Failed to delete original image from Cloudinary:`, originalDeletion.reason);
        }
        if (generatedDeletion.status === 'rejected') {
            console.warn(`Failed to delete generated image from Cloudinary:`, generatedDeletion.reason);
        }

        const { error: deleteError } = await supabase.from('designs').delete().eq('id', designId);
        
        if (deleteError) {
            throw new Error(deleteError.message);
        }

        revalidatePath('/my-designs');
        return { success: true };
    } catch (e: any) {
        console.error('Failed to delete design:', e);
        return { success: false, error: e.message || 'Could not delete the design.' };
    }
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

// This function is no longer needed as there are no user profiles to update.
export async function updateUserAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'User profiles are disabled.' };
}
