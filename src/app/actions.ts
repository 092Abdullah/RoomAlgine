
'use server';

import { z } from 'zod';
import { generateRoomStyles, GenerateRoomStylesInput } from '@/ai/flows/generate-room-styles';
import { detectRoomType } from '@/ai/flows/detect-room-type';
import { suggestStyles, SuggestStylesInput, SuggestStylesOutput } from '@/ai/flows/suggest-styles';
import { publishToGallery } from '@/ai/flows/publish-to-gallery';
import type { PublishToGalleryInput } from '@/app/types';

export async function generateRoomStylesAction(
  input: Omit<GenerateRoomStylesInput, 'photoDataUri'>,
  photoDataUri?: string | null
): Promise<{ styledRoomImages: { style: string; imageDataUri: string }[] } | { error: string }> {
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
): Promise<{ success: boolean; galleryUrl?: string; error?: string }> {
  try {
    const result = await publishToGallery(input);
    return { success: true, galleryUrl: result.galleryUrl };
  } catch (e: any) {
    console.error('Publishing failed:', e);
    return { success: false, error: e.message || 'Failed to publish to gallery.' };
  }
}
