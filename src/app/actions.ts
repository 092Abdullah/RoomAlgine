'use server';

import { ai } from '@/ai/genkit';
import { generateRoomStyles, GenerateRoomStylesInput } from '@/ai/flows/generate-room-styles';

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
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to generate room styles: ${errorMessage}` };
  }
}
