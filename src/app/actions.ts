
'use server';

import { z } from 'zod';
import { generateRoomStyles, GenerateRoomStylesInput } from '@/ai/flows/generate-room-styles';
import { generateExteriorStyles, GenerateExteriorStylesInput } from '@/ai/flows/generate-exterior-styles';
import { detectRoomType } from '@/ai/flows/detect-room-type';
import { suggestStyles, SuggestStylesInput, SuggestStylesOutput } from '@/ai/flows/suggest-styles';
import { publishToGallery } from '@/ai/flows/publish-to-gallery';
import type { PublishToGalleryInput } from '@/app/types';
import { createSupabaseServerClient } from '@/lib/supabase';
import { isToday, startOfToday } from 'date-fns';

const DAILY_DESIGN_LIMIT = 20;

async function checkAndIncrementDesignCount(supabase: any, userId: string): Promise<{ allowed: boolean; error?: string }> {
    // Fetch the user's profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('designs_created_today, last_design_created_at')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        // This case might happen if the trigger hasn't run yet for a new user.
        // We can allow the first creation and assume the profile will be created.
        return { allowed: true };
    }

    let designsToday = profile.designs_created_today || 0;
    const lastDesignDate = profile.last_design_created_at ? new Date(profile.last_design_created_at) : null;

    // Reset count if the last design was not created today
    if (lastDesignDate && !isToday(lastDesignDate)) {
        designsToday = 0;
    }
    
    if (designsToday >= DAILY_DESIGN_LIMIT) {
        return { allowed: false, error: `You have reached your daily limit of ${DAILY_DESIGN_LIMIT} designs.` };
    }

    // Increment the count
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


export async function generateRoomStylesAction(
  input: Omit<GenerateRoomStylesInput, 'photoDataUri'>,
  photoDataUri?: string | null
): Promise<{ styledRoomImages: { style: string; imageDataUri: string }[] } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to generate designs.' };
  }

  const usageCheck = await checkAndIncrementDesignCount(supabase, user.id);
  if (!usageCheck.allowed) {
    return { error: usageCheck.error };
  }
  
  if (!photoDataUri) {
    return { error: 'Please upload an image first.' };
  }
  if (input.styles.length === 0) {
    return { error: 'Please select at least one style.' };
  }
  
  try {
    const result = await generateRoomStyles({ ...input, photoDataUri });
    return result;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Error creating image, please try again.' };
  }
}

export async function generateExteriorStylesAction(
  input: Omit<GenerateExteriorStylesInput, 'photoDataUri'>,
  photoDataUri?: string | null
): Promise<{ styledExteriorImages: { style: string; imageDataUri: string }[] } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
      return { error: 'You must be logged in to generate designs.' };
  }

  const usageCheck = await checkAndIncrementDesignCount(supabase, user.id);
  if (!usageCheck.allowed) {
      return { error: usageCheck.error };
  }

  if (!photoDataUri) {
    return { error: 'Please upload an image first.' };
  }
  if (input.styles.length === 0) {
    return { error: 'Please select at least one style.' };
  }
  
  try {
    const result = await generateExteriorStyles({ ...input, photoDataUri });
    return result;
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
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'You must be logged in to publish.' };
    }
    
    // The user_id is implicitly handled by the flow, which gets it from the session.
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
        const { error } = await supabase.from('creations').delete().eq('id', creationId);
        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error('Failed to delete creation:', e);
        return { success: false, error: e.message || 'Could not delete the creation.' };
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
