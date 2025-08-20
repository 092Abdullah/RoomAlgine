
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
    const styledRoomImagePromises = input.styles.map(async style => {
      const promptText = 
`You are an expert AI interior designer. Your task is to redesign the provided room image based on a new style and function.

**CRITICAL, NON-NEGOTIABLE RULES:**
1.  **PRESERVE ARCHITECTURE:** You MUST NOT alter the room's fundamental structure. The walls, windows, doors, ceiling, and floor must remain in the exact same position and size. Do not add, remove, or change any architectural elements.
2.  **MAINTAIN CAMERA ANGLE:** The camera's perspective, angle, and field of view MUST remain IDENTICAL to the original photo. The output image must perfectly align with the input image for a smooth before/after comparison.

**REDESIGN INSTRUCTIONS:**
*   **New Room Function:** The user wants to see this space transformed into a **'${input.roomType || 'default style'}'**. You MUST replace all existing furniture, decor, and items to fit this new room function. For example, if the original is a bedroom but the user requested a living room, you must introduce sofas, coffee tables, etc., and remove the bed.
*   **New Design Style:** Apply the **'${style}'** design style. All new furniture, color palettes, textures, lighting, and decor must strictly adhere to this style's principles.
*   **User Preferences:** Incorporate these user preferences into your design:
    *   **Color Preferences:** ${input.colorPreferences && input.colorPreferences.length > 0 ? input.colorPreferences.join(', ') : 'Not specified'}
    *   **Desired Mood:** ${input.mood || 'Not specified'}
    *   **Budget Level:** The furniture and materials should reflect a budget of around ${input.priceRange || 'moderate'}.

Your output must be a single, photorealistic image of the redesigned room that strictly follows all rules and instructions.`;

      const promptPayload = [
        { media: { url: input.photoDataUri } },
        { text: promptText },
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
        return null; // Return null if generation succeeds but returns no media
      } catch (err) {
        console.error(`Image generation failed for style "${style}":`, err);
        return null; // Return null on error
      }
    });

    const results = await Promise.all(styledRoomImagePromises);
    // Filter out any null results from failed generations
    const styledRoomImages = results.filter(image => image !== null) as { style: string, imageDataUri: string }[];
    
    if (styledRoomImages.length === 0 && input.styles.length > 0) {
      throw new Error('Image generation failed for all selected styles. Please try again or adjust your preferences.');
    }

    return {
      styledRoomImages,
    };
  }
);
