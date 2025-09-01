
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
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { uploadFileToSupabase, deleteFileFromSupabase } from '@/lib/supabase/storage';
import { cookies } from 'next/headers';

const DAILY_DESIGN_LIMIT = 20;

export async function signInWithEmail(data: FormData) {
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }
    
    revalidatePath('/', 'layout');
    return { success: true };
}

export async function signUpWithEmail(data: FormData) {
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const fullName = data.get('fullName') as string;
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: fullName,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Check if the user needs verification. 
    // If auto-confirm is on, user will be null, but session will be there.
    // If verification is needed, user will have an identity but no session.
    if (result.user && !result.session) {
        return { success: true, message: 'Please check your email to verify your account.' };
    }
    
    revalidatePath('/', 'layout');
    return { success: true };
}


async function checkAndIncrementDesignCount(supabase: SupabaseClient, userId: string): Promise<{ allowed: boolean; error?: string }> {
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('designs_created_today, last_design_created_at')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        return { allowed: true };
    }

    let designsToday = profile.designs_created_today || 0;
    const lastDesignDate = profile.last_design_created_at ? new Date(profile.last_design_created_at) : null;

    if (lastDesignDate && !isToday(lastDesignDate)) {
        designsToday = 0;
    }
    
    if (designsToday >= DAILY_DESIGN_LIMIT) {
        return { allowed: false, error: `You have reached your daily limit of ${DAILY_DESIGN_LIMIT} designs.` };
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            designs_created_today: designsToday + 1,
            last_design_created_at: new Date().toISOString(),
        })
        .eq('id', userId);

    if (updateError) {
        console.error("Error updating design count:", updateError);
        return { allowed: false, error: 'Could not update your design usage. Please try again.' };
    }

    return { allowed: true };
}

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
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: 'You must be logged in to generate designs.' };
  }

  const usageCheck = await checkAndIncrementDesignCount(supabase, user.id);
  if (!usageCheck.allowed) {
    return { error: usageCheck.error ?? 'You have reached your daily design limit.' };
  }
  
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
        const generatedImageUrl = await uploadToCloudinary(image.imageDataUri, 'roomaigine_generated');

        const { data: savedDesign, error: dbError } = await supabase
            .from('designs')
            .insert({
                user_id: user.id,
                original_image_url: originalImageUrl,
                generated_image_url: generatedImageUrl,
                style: image.style,
                room_type: input.roomType,
                config: { ...input, styles: [image.style] }
            })
            .select('id, style, generated_image_url')
            .single();

        if (dbError) {
            console.error('Failed to save design to history:', dbError);
        } else if (savedDesign) {
            savedDesigns.push({
                designId: savedDesign.id,
                style: savedDesign.style,
                imageDataUri: image.imageDataUri,
            });
        }
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
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
      return { error: 'You must be logged in to generate designs.' };
  }

  const usageCheck = await checkAndIncrementDesignCount(supabase, user.id);
  if (!usageCheck.allowed) {
      return { error: usageCheck.error ?? 'You have reached your daily design limit.' };
  }

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
        const generatedImageUrl = await uploadToCloudinary(image.imageDataUri, 'roomaigine_generated_exterior');
        
        const { data: savedDesign, error: dbError } = await supabase
            .from('designs')
            .insert({
                user_id: user.id,
                original_image_url: originalImageUrl,
                generated_image_url: generatedImageUrl,
                style: image.style,
                config: { ...input, styles: [image.style] }
            })
            .select('id, style, generated_image_url')
            .single();

        if (dbError) {
            console.error('Failed to save exterior design to history:', dbError);
        } else if (savedDesign) {
            savedDesigns.push({
                designId: savedDesign.id,
                style: savedDesign.style,
                imageDataUri: image.imageDataUri,
            });
        }
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
    return { success: true, galleryUrl: result.galleryUrl, creationId: result.creationId };
  } catch (e: any) {
    console.error('Publishing failed:', e);
    return { success: false, error: e.message || 'Failed to publish to gallery.' };
  }
}

export async function deleteCreationAction(creationId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    try {
        const { error } = await supabase.from('creations').delete().eq('id', creationId);
        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error('Failed to delete creation:', e);
        return { success: false, error: e.message || 'Could not delete the creation.' };
    }
}

export async function deleteDesignAction(designId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be logged in to delete designs.' };
    }

    try {
        const { data: design, error: fetchError } = await supabase
            .from('designs')
            .select('original_image_url, generated_image_url')
            .eq('id', designId)
            .single();

        if (fetchError || !design) {
            console.error('Error fetching design for deletion:', fetchError);
            throw new Error('Design not found or you do not have permission to delete it.');
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
            console.error('Error deleting design from Supabase:', deleteError);
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
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  try {
    const { error } = await supabase.rpc('increment_kudos', { creation_id: creationId });
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    console.error('Failed to increment kudos:', e);
    return { success: false, error: e.message || 'Could not update kudos count.' };
  }
}

export async function updateUserAction(formData: FormData): Promise<{ success: boolean, error?: string }> {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be logged in to update your profile.' };
    }

    const fullName = formData.get('fullName') as string;
    const avatarDataUri = formData.get('avatarDataUri') as string | null;
    let avatarUrl = user.user_metadata.avatar_url;

    const BUCKET_NAME = 'avatars';

    try {
        if (avatarDataUri) {
            avatarUrl = await uploadFileToSupabase(avatarDataUri, BUCKET_NAME, `user_${user.id}`, avatarUrl);
        } else if (formData.has('removeAvatar')) {
            await deleteFileFromSupabase(avatarUrl, BUCKET_NAME);
            avatarUrl = null;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            data: { 
                name: fullName,
                avatar_url: avatarUrl,
            }
        });

        if (updateError) {
            throw updateError;
        }

    } catch (e: any) {
        console.error('Error updating user profile:', e);
        return { success: false, error: 'Profile update failed: ' + e.message };
    }
    
    revalidatePath('/settings');
    return { success: true };
}
