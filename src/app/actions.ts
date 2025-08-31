
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
import { uploadToCloudinary } from '@/lib/cloudinary';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const DAILY_DESIGN_LIMIT = 20;

export async function signInWithEmail(data: FormData) {
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }
    
    // Redirect logic will be handled by AuthWatcher
    return { success: true };
}

export async function signUpWithEmail(data: FormData) {
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const fullName = data.get('fullName') as string;
    const supabase = await createSupabaseServerClient();

    const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: fullName,
                // The default avatar can be set here if needed
                // avatar_url: '...', 
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Supabase sends a confirmation email. The user needs to verify.
    // We can return a success message to show on the UI.
    return { success: true, message: 'Please check your email to verify your account.' };
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
    imageDataUri: string; // We still pass the full data URI back to the client for immediate display
};

export async function generateRoomStylesAction(
  input: Omit<GenerateRoomStylesInput, 'photoDataUri'>,
  photoDataUri?: string | null
): Promise<{ styledRoomImages: GeneratedImageResult[] } | { error: string }> {
  const supabase = await createSupabaseServerClient();
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
  if (input.styles.length === 0) {
    return { error: 'Please select at least one style.' };
  }
  
  try {
    const [originalImageUrl, result] = await Promise.all([
        uploadToCloudinary(photoDataUri, 'roomaigine_originals'),
        generateRoomStyles({ ...input, photoDataUri, model: 'googleai/gemini-2.0-flash-preview-image-generation' })
    ]);

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
                imageDataUri: image.imageDataUri, // Send original data URI to client for fast display
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
  photoDataUri?: string | null
): Promise<{ styledExteriorImages: GeneratedImageResult[] } | { error: string }> {
  const supabase = await createSupabaseServerClient();
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
  if (input.styles.length === 0) {
    return { error: 'Please select at least one style.' };
  }
  
  try {
     const [originalImageUrl, result] = await Promise.all([
        uploadToCloudinary(photoDataUri, 'roomaigine_originals'),
        generateExteriorStyles({ ...input, photoDataUri, model: 'googleai/gemini-2.0-flash-preview-image-generation' })
    ]);
    
    const savedDesigns: GeneratedImageResult[] = [];

    for (const image of result.styledExteriorImages) {
        const generatedImageUrl = await uploadToCloudinary(image.imageDataUri, 'roomaigine_generated');
        
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
                imageDataUri: image.imageDataUri, // Send original data URI to client
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
    // The user check is implicitly handled by RLS policies on the 'designs' (for select)
    // and 'creations' (for insert) tables. We no longer need to explicitly check for the user here.
    const result = await publishToGallery(input);
    return { success: true, galleryUrl: result.galleryUrl, creationId: result.creationId };
  } catch (e: any) {
    console.error('Publishing failed:', e);
    return { success: false, error: e.message || 'Failed to publish to gallery.' };
  }
}

export async function deleteCreationAction(creationId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();
    try {
        // This action should probably delete from the 'designs' table now, or maybe from both?
        // For now, let's assume it deletes from 'creations' as that's what "undo publish" implies.
        const { error } = await supabase.from('creations').delete().eq('id', creationId);
        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error('Failed to delete creation:', e);
        return { success: false, error: e.message || 'Could not delete the creation.' };
    }
}

export async function deleteDesignAction(designId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be logged in to delete designs.' };
    }

    try {
        // RLS policy will ensure the user can only delete their own design.
        const { error } = await supabase.from('designs').delete().eq('id', designId);
        
        if (error) {
            console.error('Error deleting design:', error);
            throw new Error(error.message);
        }

        revalidatePath('/my-designs');
        return { success: true };
    } catch (e: any) {
        console.error('Failed to delete design:', e);
        return { success: false, error: e.message || 'Could not delete the design.' };
    }
}

export async function incrementKudosAction(creationId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
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
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'You must be logged in to update your profile.' };
    }

    const fullName = formData.get('fullName') as string;
    const avatarDataUri = formData.get('avatarDataUri') as string | null;
    let avatarUrl = user.user_metadata.avatar_url;

    if (avatarDataUri) {
       try {
            avatarUrl = await uploadToCloudinary(avatarDataUri, 'roomaigine_avatars');
       } catch (e: any) {
            return { success: false, error: 'Avatar upload failed: ' + e.message };
       }
    } else if (formData.has('removeAvatar')) {
        avatarUrl = null;
    }


    const { data, error } = await supabase.auth.updateUser({
        data: { 
            name: fullName,
            avatar_url: avatarUrl,
        }
    });

    if (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
