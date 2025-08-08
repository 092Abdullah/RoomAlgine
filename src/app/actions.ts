'use server';

import { ai } from '@/ai/genkit';
import { generateRoomStyles } from '@/ai/flows/generate-room-styles';
import { suggestFurnitureItems, type SuggestFurnitureItemsOutput } from '@/ai/flows/suggest-furniture-items';

export async function generateRoomStylesAction(
  photoDataUri: string,
  styles: string[]
): Promise<{ styledRoomImages: { style: string; imageDataUri: string }[] } | { error: string }> {
  if (!photoDataUri) {
    return { error: 'Please upload an image first.' };
  }
  if (styles.length === 0) {
    return { error: 'Please select at least one style.' };
  }
  
  try {
    const result = await generateRoomStyles({ photoDataUri, styles });
    return result;
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to generate room styles: ${errorMessage}` };
  }
}

export async function getFurnitureSuggestionsAction(
  style: string,
  imageDataUri: string
): Promise<{ furnitureSuggestions: SuggestFurnitureItemsOutput['furnitureSuggestions'] } | { error: string }> {
  try {
    const generationResult = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: [
            { media: { url: imageDataUri } },
            { text: 'Describe this room in detail for an interior designer, focusing on furniture, colors, and overall ambiance.' }
        ]
    });

    const imageDescription = generationResult.text();

    if (!imageDescription) {
        return { error: 'Could not generate a description for the image.' };
    }

    const furnitureResult = await suggestFurnitureItems({
      roomStyle: style,
      imageDescription: imageDescription,
    });
    
    return furnitureResult;
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to get furniture suggestions: ${errorMessage}` };
  }
}
