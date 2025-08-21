'use server';

/**
 * @fileOverview A room restyling AI agent that generates multiple styled versions of a room based on a user-uploaded photo and personalization options.
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
      const roomTypeKeywords = input.roomType ? ` this ${input.roomType}` : '';

      // Parse budget and determine keywords
      const budgetStr = input.priceRange ? input.priceRange.replace(/[^0-9]/g, '') : '0';
      const budgetNum = parseInt(budgetStr, 10) || 0;
      let budgetKeywords = '';
      let itemCountDescription = '';
      if (budgetNum === 0) {
        budgetKeywords = '. Do not add any new decor elements; focus solely on restyling and repurposing existing items in the room.';
      } else {
        let qualityDescription = 'simple and affordable';
        if (budgetNum <= 10000) {
          itemCountDescription = 'about 2';
        } else if (budgetNum <= 20000) {
          itemCountDescription = 'about 4';
        } else if (budgetNum <= 30000) {
          itemCountDescription = '3 to 6';
          qualityDescription = 'balanced and textured';
        } else {
          itemCountDescription = `${Math.floor(budgetNum / 5000)} or more`;
          qualityDescription = 'numerous and luxurious';
        }
        budgetKeywords = `. Add ${itemCountDescription} decor elements such as pillows, vases, plants, artwork, rugs, and accessories, using ${qualityDescription} items to enhance the space without overcrowding or altering the core layout.`;
      }

      // Assemble the final positive prompt
      const instructionPrompt = `
You are an expert AI interior designer. Your task is to edit the provided image based on my instructions.

**NON-NEGOTIABLE RULES:**
1. **PRESERVE ARCHITECTURE STRUCTURE:** Do NOT alter the positions, shapes, or layout of walls, windows, doors, ceiling, and floor. You may change their colors, textures, and materials only.
2. **MAINTAIN CAMERA ANGLE:** The camera perspective and angle MUST remain IDENTICAL to the original photo.
3. **PRESERVE FURNITURE AND OBJECTS:** Do NOT add, remove, or move any furniture or core objects in the room. Only restyle their appearance, materials, colors, and designs.
4. **DECOR ADDITIONS BASED ON BUDGET:** You may add decor elements such as pillows, vases, plants, artwork, rugs, and accessories only if specified in the task, ensuring they enhance without overcrowding.

**TASK:**
Review the existing elements in the provided room image and restyle them${roomTypeKeywords} to embody a ${styleKeywords} design${colorKeywords}${moodKeywords}${budgetKeywords}. The result should feature ${baseKeywords}.
The output must be a single, photorealistic image.`;

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
        // Continue to the next style instead of throwing an error for the whole batch
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