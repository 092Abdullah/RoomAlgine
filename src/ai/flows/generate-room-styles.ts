
'use server';

/**
 * @fileOverview A room restyling AI agent that generates multiple styled versions of a room based on a user-uploaded photo and personalization options.
 *
 * - generateRoomStyles - A function that handles the room restyling process.
 * - GenerateRoomStylesInput - The input type for the generateRoomStyles function.
 * - GenerateRoomStylesOutput - The return type for the generateRoomStyles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    const styledRoomImagePromises = input.styles.map(async (style) => {
        
        // Base prompt components
        const baseKeywords = "professional interior design photo, photorealistic, cinematic lighting, 8k, ultra-detailed, award-winning, high-end furniture and decor";
        const negativeKeywords = "blurry, pixelated, unrealistic, cartoon, amateur, watermark, text, signature, human, people";
        
        // Dynamic components from user input
        const styleKeywords = `${style} style`;
        const colorKeywords = input.colorPreferences && input.colorPreferences.length > 0 ? `, color palette includes ${input.colorPreferences.join(', ')}` : '';
        const moodKeywords = input.mood ? `, with a ${input.mood} mood` : '';

        // Room-specific keywords
        let roomSpecificKeywords = 'furniture, decor, lighting'; // Fallback
        switch (input.roomType?.toLowerCase()) {
            case 'bedroom':
                roomSpecificKeywords = 'king-size bed with upholstered headboard, matching nightstands, dresser, accent chair, area rug, curtains, decorative pillows, table lamps, ceiling fixture';
                break;
            case 'living-room':
                roomSpecificKeywords = 'large sectional sofa, coffee table, side tables, media console, bookshelf, floor lamp, statement artwork, throw blankets';
                break;
            case 'kitchen':
                roomSpecificKeywords = 'modern cabinets, quartz countertops, kitchen island with seating, pendant lights, stainless steel appliances (refrigerator, stove, oven), backsplash, bar stools';
                break;
            case 'bathroom':
                roomSpecificKeywords = 'vanity with sink, large mirror, walk-in shower with glass door, freestanding bathtub, toilet, recessed lighting, floor tiles, wall tiles';
                break;
            case 'office':
                roomSpecificKeywords = 'large executive desk, ergonomic office chair, bookshelves, filing cabinet, desk lamp, task lighting, inspirational art';
                break;
            case 'dining-room':
                roomSpecificKeywords = 'dining table that seats 8, matching dining chairs, sideboard or buffet, chandelier, area rug, centerpiece';
                break;
        }
        
        // Assemble the final positive prompt
        const positivePrompt = `A ${styleKeywords} ${input.roomType || 'room'} interior featuring ${roomSpecificKeywords}. ${baseKeywords}${colorKeywords}${moodKeywords}.`;

        const instructionPrompt = `
You are an AI interior designer. Your task is to edit the provided image based on my instructions.

**NON-NEGOTIABLE RULES:**
1.  **PRESERVE ARCHITECTURE:** Do NOT alter the room's fundamental structure. Walls, windows, doors, ceiling, and floor must remain in the exact same position and size.
2.  **MAINTAIN CAMERA ANGLE:** The camera perspective and angle MUST remain IDENTICAL to the original photo.
3.  **REMOVE ALL FURNISHINGS:** Completely remove all existing furniture, decorations, and other items from the original image before adding new ones that fit the new design.

**TASK:**
- **Positive Prompt (Your Goal):** ${positivePrompt}
- **Negative Prompt (What to Avoid):** ${negativeKeywords}

Redesign the room's interior based *only* on the positive and negative prompts, while strictly following all rules. The output must be a single, photorealistic image.`;


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
          return {
            style: style,
            imageDataUri: media.url,
          };
        }
        return null; 
      } catch (err) {
        console.error(`Image generation failed for style "${style}":`, err);
        return null;
      }
    });

    const results = await Promise.all(styledRoomImagePromises);
    const styledRoomImages = results.filter((image) => image !== null) as {
      style: string;
      imageDataUri: string;
    }[];

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
