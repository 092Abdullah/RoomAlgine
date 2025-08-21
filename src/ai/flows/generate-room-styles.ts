
'use server';

/**
 * @fileOverview A room restyling AI agent that generates a styled version of a room based on a user-uploaded photo.
 *
 * - generateRoomStyles - A function that handles the room restyling process.
 * - GenerateRoomStylesInput - The input type for the generateRoomStyles function.
 * - GenerateRoomStylesOutput - The return type for the generateRoomStyles function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRoomStylesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  styles: z
    .array(z.string())
    .describe("An array of design styles to apply to the room (e.g., minimalist, luxury, cozy, industrial)."),
  roomType: z.string().optional().describe("The type of the room (e.g. Bedroom, Living Room)."),
  colorPreferences: z.array(z.string()).optional().describe("An array of preferred colors."),
  mood: z.string().optional().describe("The desired mood for the room (e.g. Relaxed, Energetic)."),
  priceRange: z.string().optional().describe("The desired price range for the furniture and decor (e.g. $10,000, $50,000)."),
});
export type GenerateRoomStylesInput = z.infer<typeof GenerateRoomStylesInputSchema>;

const GenerateRoomStylesOutputSchema = z.object({
  styledRoomImages: z.array(
    z.object({
      style: z.string().describe("The design style applied to the room image."),
      imageDataUri: z.string().describe("The styled room image as a data URI."),
    })
  ).describe("An array of styled room images with their corresponding design styles."),
});
export type GenerateRoomStylesOutput = z.infer<typeof GenerateRoomStylesOutputSchema>;

export async function generateRoomStyles(input: GenerateRoomStylesInput): Promise<GenerateRoomStylesOutput> {
  return generateRoomStylesFlow(input);
}

const generateRoomStylesFlow = ai.defineFlow(
  {
    name: 'generateRoomStylesFlow',
    inputSchema: GenerateRoomStylesInputSchema,
    outputSchema: GenerateRoomStylesOutputSchema,
  },
  async (input) => {
    const styledRoomImages: { style: string; imageDataUri: string }[] = [];

    for (const style of input.styles) {
      // Base prompt components
      const baseKeywords = "professional interior design photo, photorealistic, cinematic lighting, 8k, ultra-detailed, high-end finishes, stylish decor";

      // Dynamic components from user input
      const styleKeywords = `${style} style`;
      const colorKeywords = input.colorPreferences && input.colorPreferences.length > 0 ? `, color palette includes ${input.colorPreferences.join(', ')}` : '';
      const moodKeywords = input.mood ? `, with a ${input.mood} mood` : '';
      
      let roomSpecificKeywords = 'a beautifully designed room'; // Fallback
      switch (input.roomType?.toLowerCase()) {
        case 'bedroom':
          roomSpecificKeywords = 'a modern bedroom with a comfortable bed, nightstands, and appropriate lighting';
          break;
        case 'living-room':
          roomSpecificKeywords = 'a contemporary living room with a sofa, coffee table, and stylish seating';
          break;
        case 'kitchen':
          roomSpecificKeywords = 'a sleek modern kitchen with updated cabinets, countertops, and modern appliances';
          break;
        case 'bathroom':
          roomSpecificKeywords = 'a spa-like bathroom with bright tiles, modern fixtures, and clean finishes';
          break;
        case 'office':
          roomSpecificKeywords = 'a productive modern office with an ergonomic desk, chair, and good lighting';
          break;
        case 'gaming-room':
          roomSpecificKeywords = 'a futuristic gaming room with stylish RGB lighting, a high-end gaming setup, and ergonomic furniture';
          break;
      }

      // Assemble the final positive prompt
      const positivePrompt = `A ${styleKeywords} version of this space, transformed into ${roomSpecificKeywords}. ${baseKeywords}${colorKeywords}${moodKeywords}.`;

      const instructionPrompt = `
You are an AI interior designer. Your task is to edit the provided image based on my instructions.

**NON-NEGOTIABLE RULES:**
1.  **PRESERVE ARCHITECTURE & POSE:** You MUST NOT alter the room's fundamental structure. Walls, windows, doors, ceiling, floor, and the camera's perspective MUST remain IDENTICAL to the original photo.
2.  **REPLACE FURNISHINGS:** Completely replace all furniture and decor to match the new style. The new items should be appropriate for the specified room type.

**TASK:**
- **Redesign the room's interior** strictly according to this goal: ${positivePrompt}
- The output must be a single, photorealistic image that respects all rules.`;

      const promptPayload = [
        { media: { url: input.photoDataUri } },
        { text: instructionPrompt },
      ];

      const generateConfig = {
        responseModalities: ['TEXT', 'IMAGE'],
      };

      try {
        const { media } = await ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: promptPayload,
          config: generateConfig,
        });

        if (media && media.url) {
          styledRoomImages.push({
            style: style,
            imageDataUri: media.url,
          });
        }
      } catch (err) {
        console.error(`Image generation failed for style "${style}":`, err);
        // Continue to the next style even if one fails
      }
    }

    if (styledRoomImages.length === 0 && input.styles.length > 0) {
      throw new Error(
        'Image generation failed for all selected styles. Please try again or adjust your preferences.'
      );
    }

    return {
      styledRoomImages,
    };
  }
);
