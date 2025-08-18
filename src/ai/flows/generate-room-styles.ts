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
  async input => {
    const ARCHITECTURE_CONSTRAINTS = `\nCONSTRAINTS (READ CAREFULLY):\n` +
      `1) Do NOT change the room architecture: preserve walls, windows, doors, built-in fixtures, ceiling height, and structural elements exactly as in the reference image.\n` +
      `2) Preserve the camera viewpoint, perspective, and crop. The generated image must match the original camera angle and framing so the before/after comparison lines up.\n` +
      `3) Do NOT add or remove windows, doors, columns, or architectural openings.\n` +
      `4) Only modify: wall colors/finishes, floor materials, movable furniture, fabrics, small decor and lighting fixtures. Do NOT move fixed items.\n` +
      `5) Do NOT change the overall layout, proportions, or apparent depth.\n` +
      `6) If possible, use image editing/inpainting (preserve structure). Do NOT hallucinate new structural elements.`;

    const styledRoomImagePromises = input.styles.map(async style => {
      let promptText = `Restyle this room in a ${style} style.`;

      if (input.roomType) {
        promptText += ` It is a ${input.roomType}.`;
      }
      if (input.priceRange) {
        promptText += ` The overall budget is around ${input.priceRange}, so the furniture and decor should reflect that.`;
      }
      if (input.colorPreferences && input.colorPreferences.length > 0) {
        promptText += ` Use the following color preferences: ${input.colorPreferences.join(', ')}.`;
      }
      if (input.mood) {
        promptText += ` The mood should be ${input.mood}.`;
      }

      promptText += ARCHITECTURE_CONSTRAINTS;
      promptText += `\nNOTE: Keep the same camera angle, perspective, framing and lighting direction as the input photo so before/after align perfectly.`;

      const promptPayload = [
        { media: { url: input.photoDataUri } },
        { text: promptText },
      ];

      const generateConfig = {
        responseModalities: ['TEXT', 'IMAGE'],
      };

      const maxRetries = 3;
      let attempt = 0;
      let delay = 1000; // start with 1s

      while (attempt < maxRetries) {
        try {
          const { media, text } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: promptPayload,
            config: generateConfig,
          });

          if (media && media.url) {
            return {
              style: style,
              imageDataUri: media.url,
              debugText: text,
            };
          }
          // If no media is returned, we can retry with a stronger prompt.
          promptPayload.push({ text: '\nRETRY: You must return an image. Absolutely do NOT change windows, doors, walls or camera angle. Preserve all architectural features exactly.' });

        } catch (err: any) {
          // Check for rate limit error (429)
          if (err.message && err.message.includes('429')) {
              console.warn(`Rate limit exceeded for style: ${style}. Retrying in ${delay / 1000}s...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
          } else {
            // For other errors, we can log them and stop retrying for this style.
            console.error(`Image generation failed for style "${style}" on attempt ${attempt + 1}:`, err);
            // Break the loop and return null or throw. Returning null will filter it out later.
            return null;
          }
        }
        attempt++;
      }
      console.error(`Image generation failed for style: ${style} after ${maxRetries} attempts.`);
      return null;
    });

    const results = await Promise.all(styledRoomImagePromises);
    const styledRoomImages = results.filter(image => image !== null) as { style: string, imageDataUri: string }[];
    
    if (styledRoomImages.length === 0 && input.styles.length > 0) {
      throw new Error('Image generation failed for all selected styles. Please try again later.');
    }

    return {
      styledRoomImages,
    };
  }
);
